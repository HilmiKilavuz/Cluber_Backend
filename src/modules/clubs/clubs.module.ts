import { Module } from '@nestjs/common';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';

/**
 * Clubs feature module.
 *
 * Folder purpose: `src/modules/clubs/`
 * - Club CRUD operations.
 * - Membership actions (join/leave).
 */
@Module({
  // REST endpoints for club operations.
  controllers: [ClubsController],

  // Business logic for clubs.
  providers: [ClubsService],

  // Exported so other modules can reuse club logic if needed.
  exports: [ClubsService],
})
export class ClubsModule {}

