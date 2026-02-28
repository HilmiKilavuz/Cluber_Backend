import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Server } from 'socket.io';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Chat business logic service.
 *
 * Responsibilities:
 * - Validate that user is member of the target club.
 * - Persist chat messages to database.
 * - Broadcast realtime events to socket rooms.
 */
@Injectable()
export class ChatService {
  // Logger for security/operational warnings.
  private readonly logger = new Logger(ChatService.name);

  // Socket server instance is injected later by ChatGateway.afterInit().
  private server: Server | null = null;

  // Prisma service for DB operations.
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Called by gateway once WebSocket server is ready.
   */
  setServer(server: Server): void {
    this.server = server;
  }

  /**
   * Validates membership before allowing room join.
   */
  async joinRoom(clubId: string, userId: string): Promise<void> {
    await this.ensureMember(clubId, userId);
  }

  /**
   * Saves and broadcasts a new message to club room.
   */
  async sendMessage(clubId: string, userId: string, content: string) {
    // Ensure sender belongs to this club.
    await this.ensureMember(clubId, userId);

    // Persist message record and include sender info for UI.
    const message = await this.prisma.message.create({
      data: {
        clubId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    // Emit realtime event to all sockets joined in this club room.
    this.server?.to(this.getRoomName(clubId)).emit('chat:new-message', message);
    return message;
  }

  /**
   * Returns last 50 messages for a club.
   */
  async getRecentMessages(clubId: string, userId: string) {
    // Membership check prevents unauthorized message reading.
    await this.ensureMember(clubId, userId);

    return this.prisma.message.findMany({
      where: { clubId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
  }

  /**
   * Returns deterministic socket room name for a club.
   */
  getRoomName(clubId: string): string {
    return `club:${clubId}`;
  }

  /**
   * Internal authorization helper for chat access.
   */
  private async ensureMember(clubId: string, userId: string): Promise<void> {
    // Check club existence and active status.
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, isActive: true },
    });

    if (!club || !club.isActive) {
      throw new NotFoundException('Club not found or inactive');
    }

    // Check user-club membership relation.
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    if (!membership) {
      // Useful warning for suspicious access attempts.
      this.logger.warn(`User ${userId} tried to access club ${clubId} chat without membership`);
      throw new ForbiddenException('You must be a member to access this chat');
    }
  }
}

