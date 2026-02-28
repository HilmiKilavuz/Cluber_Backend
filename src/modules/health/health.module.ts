import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

/**
 * Health feature module.
 *
 * Folder purpose: `src/modules/health/`
 * - Exposes endpoints for uptime/health probes.
 * - Used by Docker, load balancer, or monitoring tools.
 */
@Module({
  // HTTP endpoints for health checks.
  controllers: [HealthController],

  // Business logic for health checks.
  providers: [HealthService],
})
export class HealthModule {}
