import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { UserRole, UserStatus } from 'src/common/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { ResponseUtil } from 'src/common/utils/response.util';
import { EmailService } from 'src/email/email.service';
import { EmailVerification } from './entities/email-verification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password' | 'refreshToken' | 'emailToLowerCase'>> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException(
        `User with the email ${email} does not exist`,
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Account is not active. Please verify your email.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const {
      password: _,
      refreshToken: __,
      emailToLowerCase: ___,
      ...result
    } = user;
    return result as Omit<
      User,
      'password' | 'refreshToken' | 'emailToLowerCase'
    >;
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException(
        `User with the email ${registerDto.email} already exist`,
      );
    }

    //Add validation for role specific fields [CONSUMER,FARMER,RETAILER]

    const hashedPassword = await this.hashPassword(registerDto.password);

    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
      status: UserStatus.PENDING,
    });

    //Add email verification logic
    const token = await this.sendVerificationEmail(user);

    const { password: _, refreshToken: __, ...result } = user;

    return ResponseUtil.success({ user: result, token }, 'Registration successful');
  }
  async sendVerificationEmail(user: User): Promise<string> {
    // Generate random token
   const token = crypto.randomInt(100000, 1000000).toString();

    // Set expiration (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Delete any existing verification tokens for this user
    await this.emailVerificationRepository.delete({ userId: user.id });

    // Create new verification record
    await this.emailVerificationRepository.save({
      userId: user.id,
      token,
      expiresAt,
      isUsed: false,
    });

    // Send email
    await this.emailService.sendVerificationEmail(
      user.email,
      token,
      user.firstName,
    );

    return token
  }

  async verifyEmail(token: string) {
    const verification = await this.emailVerificationRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!verification) {
      throw new BadRequestException('Invalid verification token');
    }

    if (verification.isUsed) {
      throw new BadRequestException('This verification link has already been used');
    }

    if (new Date() > verification.expiresAt) {
      throw new BadRequestException('Verification link has expired');
    }

    // Update user status to ACTIVE
    await this.userService.update(verification.userId, {
      status: UserStatus.ACTIVE,
    });

    // Mark verification as used
    verification.isUsed = true;
    await this.emailVerificationRepository.save(verification);

    return ResponseUtil.success(
      null,
      'Email verified successfully. You can now log in.',
    );
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException('Email is already verified');
    }

    await this.sendVerificationEmail(user);

    return ResponseUtil.success(
      null,
      'Verification email sent successfully',
    );
  }

  async login(user: User) {
    const tokens = await this.getTokens(user.id, user.email, user.role);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    await this.userService.updateLastLogin(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ...tokens,
      message: 'Login successful',
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = bcrypt.compare(refreshToken, user.refreshToken);

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return ResponseUtil.success(tokens, 'Tokens refreshed successfully');
  }

  async logout(userId: string) {
    await this.userService.update(userId, { refreshToken: '' });
    return ResponseUtil.success(null, 'Logout successful');
  }

  private async getTokens(userId: string, email: string, role: UserRole) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashPassword(refreshToken);

    await this.userService.update(userId, { refreshToken: hashedRefreshToken });
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
