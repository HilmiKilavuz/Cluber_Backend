import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

interface JoinRoomPayload {
  clubId: string;
}

interface SendMessagePayload {
  clubId: string;
  content: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(): void {
    this.chatService.setServer(this.server);
  }

  async handleConnection(client: Socket): Promise<void> {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET', 'dev-secret-change-me'),
      });
      client.data.user = payload;
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('chat:join-room')
  async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() body: JoinRoomPayload) {
    const user = this.getSocketUser(client);
    await this.chatService.joinRoom(body.clubId, user.sub);
    await client.join(this.chatService.getRoomName(body.clubId));
    return { joined: true, clubId: body.clubId };
  }

  @SubscribeMessage('chat:send-message')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: SendMessagePayload,
  ) {
    const user = this.getSocketUser(client);
    return this.chatService.sendMessage(body.clubId, user.sub, body.content);
  }

  private getSocketUser(client: Socket): JwtPayload {
    const user = client.data.user as JwtPayload | undefined;
    if (!user) {
      throw new UnauthorizedException('Socket is not authenticated');
    }

    return user;
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken.startsWith('Bearer ') ? authToken.slice(7) : authToken;
    }

    const headerToken = client.handshake.headers.authorization;
    if (typeof headerToken === 'string' && headerToken.startsWith('Bearer ')) {
      return headerToken.slice(7);
    }

    const cookieHeader = client.handshake.headers.cookie;
    if (typeof cookieHeader === 'string') {
      const cookies = cookieHeader.split(';').map((entry) => entry.trim());
      const accessTokenCookie = cookies.find((entry) => entry.startsWith('access_token='));
      if (accessTokenCookie) {
        return decodeURIComponent(accessTokenCookie.slice('access_token='.length));
      }
    }

    return null;
  }
}

