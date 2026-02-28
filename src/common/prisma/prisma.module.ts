import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global database module.
 *
 * @Global() means this module is visible to all other modules
 * without re-importing it everywhere.
 */
@Global()
@Module({
  // PrismaService is the singleton DB client wrapper.
  providers: [PrismaService],

  // Export PrismaService so other modules can inject it.
  exports: [PrismaService],
})
export class PrismaModule {}
