import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Service layer for health checks.
 *
 * Why this exists:
 * - Controller should stay thin (only route mapping).
 * - Health logic (app + DB checks) lives here.
 */
@Injectable()
export class HealthService {
  // Logger for operational diagnostics.
  private readonly logger = new Logger(HealthService.name);

  // Prisma is injected to run DB connectivity probe.
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Basic in-memory health check.
   *
   * If this method returns, Node/Nest process is alive.
   */
  check(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Database health check.
   *
   * Executes a minimal raw query (`SELECT 1`) to verify that
   * PostgreSQL is reachable and responding.
   */
  async checkDatabase(): Promise<{ status: string; database: string; timestamp: string }> {
    try {
      // Minimal no-op query for connectivity testing.
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // Log and return a safe response instead of crashing endpoint.
      this.logger.error('Database health check failed', error);
      return {
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
