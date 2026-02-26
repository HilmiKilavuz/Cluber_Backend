import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberRole } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async createClub(userId: string, dto: CreateClubDto) {
    const exists = await this.prisma.club.findUnique({ where: { name: dto.name } });
    if (exists) {
      throw new ConflictException('Club name already exists');
    }

    return this.prisma.club.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        imageUrl: dto.imageUrl ?? null,
        creatorId: userId,
        memberships: {
          create: {
            userId,
            role: MemberRole.ADMIN,
          },
        },
      },
      include: {
        memberships: true,
      },
    });
  }

  async listClubs() {
    return this.prisma.club.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        _count: {
          select: {
            memberships: true,
          },
        },
      },
    });
  }

  async getClubById(clubId: string) {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
          },
        },
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    return club;
  }

  async updateClub(clubId: string, userId: string, dto: UpdateClubDto) {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      select: {
        id: true,
        creatorId: true,
      },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    const isAllowed = club.creatorId === userId || membership?.role === MemberRole.ADMIN;
    if (!isAllowed) {
      throw new ForbiddenException('You do not have permission to update this club');
    }

    return this.prisma.club.update({
      where: { id: clubId },
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        imageUrl: dto.imageUrl,
        isActive: dto.isActive,
      },
    });
  }

  async deleteClub(clubId: string, userId: string) {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      select: { id: true, creatorId: true },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    if (club.creatorId !== userId) {
      throw new ForbiddenException('Only club creator can delete this club');
    }

    await this.prisma.club.delete({ where: { id: clubId } });
    return { deleted: true };
  }

  async joinClub(clubId: string, userId: string) {
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club || !club.isActive) {
      throw new NotFoundException('Club not found or inactive');
    }

    const existing = await this.prisma.membership.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('You are already a member of this club');
    }

    return this.prisma.membership.create({
      data: {
        userId,
        clubId,
        role: MemberRole.MEMBER,
      },
    });
  }

  async leaveClub(clubId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    await this.prisma.membership.delete({ where: { id: membership.id } });
    return { left: true };
  }
}

