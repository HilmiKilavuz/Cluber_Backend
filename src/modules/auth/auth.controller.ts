import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { VerifyEmailDto } from './dto/verify-email.dto';

/**
 * Authentication HTTP controller.
 *
 * Controller responsibility:
 * - Receive HTTP request.
 * - Validate body via DTO decorators (global ValidationPipe).
 * - Delegate business logic to AuthService.
 * - Shape cookie/response.
 */
@Controller('auth')
export class AuthController {
  // Inject authentication business logic service.
  constructor(private readonly authService: AuthService) { }

  /**
   * POST /auth/register
   * Creates a new user account and sets access token cookie.
   */
  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
  ) {
    // Create user. Wait for email verify to drop the token.
    return await this.authService.register(dto);
  }

  /**
   * POST /auth/login
   * Verifies credentials and sets access token cookie.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Validate credentials and issue token.
    const result = await this.authService.login(dto);

    // Persist token in HttpOnly cookie for subsequent requests.
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: this.authService.getCookieMaxAgeMs(),
      path: '/',
    });

    // Return sanitized user object and token.
    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  /**
   * POST /auth/verify-email
   * Verifies a newly registered user's email address and signs them in.
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.verifyEmail(dto);

    // Store JWT in HttpOnly cookie (cannot be read by JS in browser).
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: this.authService.getCookieMaxAgeMs(),
      path: '/',
    });

    return {
      user: result.user,
      accessToken: result.accessToken,
      message: 'Email successfully verified',
    };
  }

  /**
   * POST /auth/logout
   * Clears access token cookie.
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
  }

  /**
   * GET /auth/me
   * Returns currently authenticated user profile.
   */
  @Get('me')
  async me(@CurrentUser() user: JwtPayload, @Req() _request: Request) {
    return this.authService.getProfile(user.sub);
  }
}

