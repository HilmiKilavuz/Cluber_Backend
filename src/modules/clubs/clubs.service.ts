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

/**
 * Clubs business logic service.
 *
 * Service responsibilities:
 * - Create/list/read/update/delete clubs.
 * - Manage membership join/leave rules.
 * - Enforce authorization checks for sensitive actions.
 */
@Injectable()
export class ClubsService {
  // Inject Prisma database service.
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new club and adds creator as ADMIN member.
   */
  async createClub(userId: string, dto: CreateClubDto) {
    // Club names are unique; prevent duplicates.
    const exists = await this.prisma.club.findUnique({ where: { name: dto.name } });
    if (exists) {
      throw new ConflictException('Club name already exists');
    }

    // Create club + initial membership in one operation.
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

  /**
   * Returns all clubs ordered by newest first.
   */
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

  /**
   * Returns a single club with creator and membership details.
   */
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

    // Explicit 404 if club does not exist.
    if (!club) {
      throw new NotFoundException('Club not found');
    }

    return club;
  }

  /**
   * Updates club fields if caller is creator or admin member.
   */
  async updateClub(clubId: string, userId: string, dto: UpdateClubDto) {
    // Fetch minimal fields needed for authorization.
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

    // Check caller role in membership table.
    const membership = await this.prisma.membership.findUnique({
      where: {
        userId_clubId: {
          userId,
          clubId,
        },
      },
    });

    // Allow update for creator or ADMIN role.
    const isAllowed = club.creatorId === userId || membership?.role === MemberRole.ADMIN;
    if (!isAllowed) {
      throw new ForbiddenException('You do not have permission to update this club');
    }

    // Partial update; undefined fields are ignored by Prisma.
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

  /**
   * Deletes a club. Only creator can delete.
   */
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

    // Cascades may remove related records depending on schema relations.
    await this.prisma.club.delete({ where: { id: clubId } });
    return { deleted: true };
  }

  /**
   * Adds user as MEMBER to an active club.
   */
  async joinClub(clubId: string, userId: string) {
    // User can only join existing active clubs.
    const club = await this.prisma.club.findUnique({ where: { id: clubId } });
    if (!club || !club.isActive) {
      throw new NotFoundException('Club not found or inactive');
    }

    // Prevent duplicate membership rows.
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
        // Default role for join action.
        role: MemberRole.MEMBER,
      },
    });
  }

  /**
   * Removes user membership from a club.
   */
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

    // Delete membership relation.
    await this.prisma.membership.delete({ where: { id: membership.id } });
    return { left: true };
  }
}

