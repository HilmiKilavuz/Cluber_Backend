import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MailModule } from '../mail/mail.module';

/**
 * Authentication feature module.
 *
 * Folder purpose: `src/modules/auth/`
 * - User register/login/logout flows.
 * - JWT creation and verification helpers.
 * - Auth-related decorators, guards, interfaces, DTOs.
 */
@Module({
  imports: [
    // Gives access to environment variables via ConfigService.
    ConfigModule,

    // Configures JWT service asynchronously with env-based secret/expiry.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Secret used to sign/verify JWT tokens.
        secret: configService.get<string>('JWT_SECRET', 'dev-secret-change-me'),
        signOptions: {
          // Token lifetime, e.g. 15m.
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
    MailModule,
  ],

  // HTTP routes for auth operations.
  controllers: [AuthController],

  // Service logic + guard provider.
  providers: [AuthService, JwtAuthGuard],

  // Exported so other modules can reuse auth service/guard/jwt service.
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}

