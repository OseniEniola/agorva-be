import { Body, ClassSerializerInterceptor, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request, UseInterceptors, Query } from "@nestjs/common";
import { Public } from "./decorators/public.decorator";
import { RegisterDto } from "./dto/register.dto";
import { AuthGuard } from "@nestjs/passport";
import { LoginDto } from "./dto/login.dto";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { ResponseUtil } from "src/common/utils/response.util";
import { AuthService } from "./auth.service";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { User } from "src/users/entities/user.entity";
import { BaseResponse } from "src/common/interfaces/api-response";
import { ResendVerificationDto, VerifyEmailDto } from "./dto/verify-email.dto";

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Create a new user account (Customer, Farmer, or Retailer)',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: BaseResponse<User>,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - email already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

    @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(@Query() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Public()
  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(resendDto.email);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@CurrentUser() user: any) {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return ResponseUtil.success(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
      'Profile retrieved successfully'
    );
  }
}