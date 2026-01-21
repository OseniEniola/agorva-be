import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<Omit<User, 'password' | 'refreshToken' | 'emailToLowerCase'>> {
    const user = await this.authService.validateUser(email,password)

    if(!user){
        throw new UnauthorizedException("Invalid Credentials")
    }

    return user;
  }
}
