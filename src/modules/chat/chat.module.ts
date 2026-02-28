import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

/**
 * Chat feature module.
 *
 * Folder purpose: `src/modules/chat/`
 * - REST endpoints for fetching/sending messages.
 * - WebSocket gateway for realtime chat events.
 */
@Module({
  imports: [
    // Access to ConfigService for reading JWT secret.
    ConfigModule,

    // JWT module used by ChatGateway to verify socket tokens.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Shared JWT secret with auth module.
        secret: configService.get<string>('JWT_SECRET', 'dev-secret-change-me'),
      }),
    }),
  ],

  // REST controller for HTTP-based chat operations.
  controllers: [ChatController],

  // Service + WebSocket gateway providers.
  providers: [ChatService, ChatGateway],

  // Export service for possible reuse in other modules.
  exports: [ChatService],
})
export class ChatModule {}

