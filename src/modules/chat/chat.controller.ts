import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { SendMessageDto } from './dto/send-message.dto';

/**
 * Chat HTTP controller.
 *
 * Provides REST endpoints for:
 * - Fetching recent messages of a club.
 * - Sending a new message to a club.
 */
@Controller('chat')
export class ChatController {
  // Inject chat business service.
  constructor(private readonly chatService: ChatService) {}

  /**
   * GET /chat/:clubId/messages
   * Returns recent messages for a club (member-only access).
   */
  @Get(':clubId/messages')
  getRecentMessages(@Param('clubId') clubId: string, @CurrentUser() user: JwtPayload) {
    return this.chatService.getRecentMessages(clubId, user.sub);
  }

  /**
   * POST /chat/:clubId/messages
   * Sends a message as current user to given club.
   */
  @Post(':clubId/messages')
  sendMessage(
    @Param('clubId') clubId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.sendMessage(clubId, user.sub, dto.content);
  }
}

