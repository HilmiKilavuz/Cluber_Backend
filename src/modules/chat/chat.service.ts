import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Server } from 'socket.io';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private server: Server | null = null;

  constructor(private readonly prisma: PrismaService) {}

  setServer(server: Server): void {
    this.server = server;
  }

  async joinRoom(clubId: string, userId: string): Promise<void> {
    await this.ensureMember(clubId, userId);
  }

  async sendMessage(clubId: string, userId: string, content: string) {
    await this.ensureMember(clubId, userId);

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

    this.server?.to(this.getRoomName(clubId)).emit('chat:new-message', message);
    return message;
  }

  async getRecentMessages(clubId: string, userId: string) {
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

  getRoomName(clubId: string): string {
    return `club:${clubId}`;
  }

  private async ensureMember(clubId: string, userId: string): Promise<void> {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, isActive: true },
    });

    if (!club || !club.isActive) {
      throw new NotFoundException('Club not found or inactive');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    if (!membership) {
      this.logger.warn(`User ${userId} tried to access club ${clubId} chat without membership`);
      throw new ForbiddenException('You must be a member to access this chat');
    }
  }
}

