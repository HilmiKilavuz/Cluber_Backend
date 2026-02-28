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

/**
 * Payload for `chat:join-room` socket event.
 */
interface JoinRoomPayload {
  clubId: string;
}

/**
 * Payload for `chat:send-message` socket event.
 */
interface SendMessagePayload {
  clubId: string;
  content: string;
}

/**
 * WebSocket gateway for realtime chat.
 *
 * Responsibilities:
 * - Authenticate socket connection using JWT.
 * - Join users to club-specific socket rooms.
 * - Handle realtime message events.
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection {
  // Raw socket.io server instance managed by Nest gateway.
  @WebSocketServer()
  server!: Server;

  // Inject chat service + JWT helpers.
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Called after gateway initialization.
   * Passes socket server to ChatService so service can broadcast events.
   */
  afterInit(): void {
    this.chatService.setServer(this.server);
  }

  /**
   * Called on every new socket connection.
   * Disconnects client if token is missing/invalid.
   */
  async handleConnection(client: Socket): Promise<void> {
    // Extract token from handshake auth/header/cookie.
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      // Verify JWT and store payload in socket data.
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET', 'dev-secret-change-me'),
      });
      client.data.user = payload;
    } catch {
      // Authentication failed.
      client.disconnect();
    }
  }

  /**
   * Event: chat:join-room
   * Adds authenticated socket into target club room.
   */
  @SubscribeMessage('chat:join-room')
  async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() body: JoinRoomPayload) {
    const user = this.getSocketUser(client);
    await this.chatService.joinRoom(body.clubId, user.sub);
    await client.join(this.chatService.getRoomName(body.clubId));
    return { joined: true, clubId: body.clubId };
  }

  /**
   * Event: chat:send-message
   * Persists and broadcasts message to the room.
   */
  @SubscribeMessage('chat:send-message')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: SendMessagePayload,
  ) {
    const user = this.getSocketUser(client);
    return this.chatService.sendMessage(body.clubId, user.sub, body.content);
  }

  /**
   * Returns authenticated user payload from socket context.
   */
  private getSocketUser(client: Socket): JwtPayload {
    const user = client.data.user as JwtPayload | undefined;
    if (!user) {
      throw new UnauthorizedException('Socket is not authenticated');
    }

    return user;
  }

  /**
   * Extracts token from different handshake locations.
   */
  private extractToken(client: Socket): string | null {
    // Preferred source: client.handshake.auth.token
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken.startsWith('Bearer ') ? authToken.slice(7) : authToken;
    }

    // Alternative: Authorization header.
    const headerToken = client.handshake.headers.authorization;
    if (typeof headerToken === 'string' && headerToken.startsWith('Bearer ')) {
      return headerToken.slice(7);
    }

    // Alternative: access_token cookie from handshake headers.
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

