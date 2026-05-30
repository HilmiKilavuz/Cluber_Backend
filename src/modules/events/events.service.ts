import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { RsvpDto } from './dto/rsvp.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
    constructor(private readonly prisma: PrismaService) { }

    async createEvent(userId: string, dto: CreateEventDto) {
        const club = await this.prisma.club.findUnique({
            where: { id: dto.clubId },
        });

        if (!club) {
            throw new NotFoundException('Club not found');
        }

        if (club.creatorId !== userId) {
            throw new ForbiddenException('Only club creator can create events');
        }

        return this.prisma.event.create({
            data: {
                title: dto.title,
                description: dto.description,
                date: new Date(dto.date),
                location: dto.location,
                clubId: dto.clubId,
            },
        });
    }

    async listEvents(query: EventQueryDto) {
        const { page = 1, limit = 12, clubId, search } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.EventWhereInput = {};
        if (clubId) where.clubId = clubId;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.prisma.event.findMany({
                where,
                skip,
                take: limit,
                include: {
                    club: {
                        select: {
                            name: true,
                            imageUrl: true,
                            category: true,
                        },
                    },
                    _count: {
                        select: {
                            participants: true,
                        },
                    },
                    participants: {
                        select: {
                            userId: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.event.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getParticipatingEvents(userId: string) {
        const now = new Date();
        return this.prisma.event.findMany({
            where: {
                date: { gte: now },
                participants: {
                    some: { userId },
                },
            },
            include: {
                club: {
                    select: {
                        name: true,
                        imageUrl: true,
                        category: true,
                    },
                },
                _count: {
                    select: {
                        participants: true,
                    },
                },
                participants: {
                    select: {
                        userId: true,
                    },
                },
            },
            orderBy: { date: 'asc' },
        });
    }

    async getEventById(id: string) {
        const event = await this.prisma.event.findUnique({
            where: { id },
            include: {
                club: true,
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return event;
    }

    async updateEvent(id: string, userId: string, dto: UpdateEventDto) {
        const event = await this.getEventById(id);

        if (event.club.creatorId !== userId) {
            throw new ForbiddenException('Only club creator can update events');
        }

        return this.prisma.event.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                location: dto.location,
                date: dto.date ? new Date(dto.date) : undefined,
            },
        });
    }

    async deleteEvent(id: string, userId: string) {
        const event = await this.getEventById(id);

        if (event.club.creatorId !== userId) {
            throw new ForbiddenException('Only club creator can delete events');
        }

        await this.prisma.event.delete({ where: { id } });
        return { deleted: true };
    }

    async rsvp(eventId: string, userId: string, dto: RsvpDto) {
        const event = await this.getEventById(eventId);

        // For simplicity, we just track participants in the EventParticipant join table.
        // In a real app, we might store the specific RSVP status (GOING, etc.).
        // Currently, our schema only has a simple Join table. 
        // I will check the schema again.

        return this.prisma.eventParticipant.upsert({
            where: {
                userId_eventId: {
                    userId,
                    eventId,
                },
            },
            create: {
                userId,
                eventId,
            },
            update: {
                // Just updating the join if it already exists
                joinedAt: new Date(),
            },
        });
    }

    async cancelRsvp(eventId: string, userId: string) {
        const participant = await this.prisma.eventParticipant.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId,
                },
            },
        });

        if (!participant) {
            throw new NotFoundException('RSVP not found');
        }

        await this.prisma.eventParticipant.delete({
            where: { id: participant.id },
        });
        return { cancelled: true };
    }
}
