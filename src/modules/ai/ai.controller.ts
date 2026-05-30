import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

/**
 * AI HTTP controller.
 *
 * Routes:
 * - POST /ai/profile-insight — generates a profile character analysis
 *   and club recommendations for the authenticated user.
 *
 * All routes require a valid JWT (global guard applies).
 */
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/profile-insight
   *
   * Analyzes the user's club memberships and returns:
   * - A character description
   * - Detected interest areas
   * - Suggestion sentences ("if you like X, try Y")
   * - Recommended clubs the user hasn't joined yet
   *
   * Returns 400 if user has no club memberships.
   */
  @HttpCode(HttpStatus.OK)
  @Post('profile-insight')
  async getProfileInsight(@CurrentUser() user: JwtPayload) {
    return this.aiService.generateProfileInsight(user.sub);
  }
}
