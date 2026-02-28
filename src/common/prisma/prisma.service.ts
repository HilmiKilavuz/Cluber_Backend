import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Shared database service for the whole backend.
 *
 * Why this class exists:
 * - PrismaClient is the low-level DB client.
 * - NestJS needs lifecycle hooks to open/close DB cleanly.
 * - By extending PrismaClient, all generated query APIs are available directly.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Logger helps us track DB lifecycle in container/terminal logs.
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Constructor configures Prisma logging behavior.
   */
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  /**
   * Called once when Nest module initializes.
   * We open DB connection here.
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to database...');
    await this.$connect();
    this.logger.log('Database connection established');
  }

  /**
   * Called when Nest app/module is shutting down.
   * We close DB connection gracefully.
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }
}
