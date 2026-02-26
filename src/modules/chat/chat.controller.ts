import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':clubId/messages')
  getRecentMessages(@Param('clubId') clubId: string, @CurrentUser() user: JwtPayload) {
    return this.chatService.getRecentMessages(clubId, user.sub);
  }

  @Post(':clubId/messages')
  sendMessage(
    @Param('clubId') clubId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatService.sendMessage(clubId, user.sub, dto.content);
  }
}

