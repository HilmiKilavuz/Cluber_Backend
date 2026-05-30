import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ClubsModule } from '../clubs/clubs.module';

/**
 * AI feature module.
 *
 * Provides:
 * - Profile insight generation via OpenRouter (owl-alpha model)
 * - Club recommendation based on user's existing memberships
 *
 * Dependencies:
 * - HttpModule: for making HTTP requests to OpenRouter API
 * - ClubsModule: to fetch user's joined clubs and all clubs
 */
@Module({
  imports: [
    // Axios-based HTTP client for external API calls.
    // 60s timeout because LLM responses can be slow.
    HttpModule.register({
      timeout: 60000,
      maxRedirects: 3,
    }),
    // Re-uses ClubsService to fetch club & membership data.
    ClubsModule,
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
