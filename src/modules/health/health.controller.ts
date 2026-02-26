import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

/**
 * Health check controller for monitoring application status.
 * Useful for Docker health checks and load balancer probes.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(): { status: string; timestamp: string } {
    return this.healthService.check();
  }

  @Get('db')
  async checkDatabase(): Promise<{ status: string; database: string; timestamp: string }> {
    return this.healthService.checkDatabase();
  }
}
