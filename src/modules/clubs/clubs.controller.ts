import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

/**
 * Clubs HTTP controller.
 *
 * Handles route mapping for club operations and delegates
 * business rules to ClubsService.
 */
@Controller('clubs')
export class ClubsController {
  // Inject service layer.
  constructor(private readonly clubsService: ClubsService) {}

  /**
   * POST /clubs
   * Creates a new club for authenticated user.
   */
  @Post()
  create(@Body() dto: CreateClubDto, @CurrentUser() user: JwtPayload) {
    return this.clubsService.createClub(user.sub, dto);
  }

  /**
   * GET /clubs
   * Returns list of clubs.
   */
  @Get()
  list() {
    return this.clubsService.listClubs();
  }

  /**
   * GET /clubs/:clubId
   * Returns detailed info for one club.
   */
  @Get(':clubId')
  getById(@Param('clubId') clubId: string) {
    return this.clubsService.getClubById(clubId);
  }

  /**
   * PATCH /clubs/:clubId
   * Updates club data (creator/admin authorization required).
   */
  @Patch(':clubId')
  update(
    @Param('clubId') clubId: string,
    @Body() dto: UpdateClubDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clubsService.updateClub(clubId, user.sub, dto);
  }

  /**
   * DELETE /clubs/:clubId
   * Deletes a club (creator only).
   */
  @Delete(':clubId')
  remove(@Param('clubId') clubId: string, @CurrentUser() user: JwtPayload) {
    return this.clubsService.deleteClub(clubId, user.sub);
  }

  /**
   * POST /clubs/:clubId/join
   * Adds current user as member to the club.
   */
  @Post(':clubId/join')
  join(@Param('clubId') clubId: string, @CurrentUser() user: JwtPayload) {
    return this.clubsService.joinClub(clubId, user.sub);
  }

  /**
   * POST /clubs/:clubId/leave
   * Removes current user's membership from the club.
   */
  @HttpCode(HttpStatus.OK)
  @Post(':clubId/leave')
  leave(@Param('clubId') clubId: string, @CurrentUser() user: JwtPayload) {
    return this.clubsService.leaveClub(clubId, user.sub);
  }
}

