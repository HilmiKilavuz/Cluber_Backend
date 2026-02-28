import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../auth/decorators/public.decorator';

/**
 * HTTP controller for health endpoints.
 *
 * Marked as `@Public()` so probes can access it without JWT.
 */
@Controller('health')
@Public()
export class HealthController {
  // Inject service that contains actual check logic.
  constructor(private readonly healthService: HealthService) {}

  /**
   * GET /health
   * Quick process-level health response.
   */
  @Get()
  check(): { status: string; timestamp: string } {
    return this.healthService.check();
  }

  /**
   * GET /health/db
   * Database connectivity health response.
   */
  @Get('db')
  async checkDatabase(): Promise<{ status: string; database: string; timestamp: string }> {
    return this.healthService.checkDatabase();
  }
}
