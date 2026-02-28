import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { ChatModule } from './modules/chat/chat.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

/**
 * Root NestJS module.
 *
 * In NestJS, every feature is grouped into modules.
 * This module wires all feature modules together and configures
 * application-wide guards/providers.
 */
@Module({
  imports: [
    // Loads environment variables and makes ConfigService available globally.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Global rate-limit policies to reduce brute-force and abuse traffic.
    ThrottlerModule.forRoot([
      {
        // Very short window policy (highly sensitive routes).
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        // Medium window policy (normal API usage).
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        // Long window policy (overall burst protection).
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Shared Prisma database module.
    PrismaModule,

    // Business feature modules.
    HealthModule,
    AuthModule,
    ClubsModule,
    ChatModule,
  ],
  providers: [
    // Applies throttling guard to every request.
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // Applies JWT authentication guard globally.
    // Public routes can bypass it via @Public() decorator.
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
