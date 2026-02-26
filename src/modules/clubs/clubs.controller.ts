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

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  create(@Body() dto: CreateClubDto, @CurrentUser() user: JwtPayload) {
    return this.clubsService.createClub(user.sub, dto);
  }

  @Get()
  list() {
    return this.clubsService.listClubs();
  }

  @Get(':clubId')
  getById(@Param('clubId') clubId: string) {
    return this.clubsService.getClubById(clubId);
  }

  @Patch(':clubId')
  update(
    @Param('clubId') clubId: string,
    @Body() dto: UpdateClubDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clubsService.updateClub(clubId, user.sub, dto);
  }

  @Delete(':clubId')
  remove(@Param('clubId') clubId: string, @CurrentUser() user: JwtPayload) {
    return this.clubsService.deleteClub(clubId, user.sub);
  }

  @Post(':clubId/join')
  join(@Param('clubId') clubId: string, @CurrentUser() user: JwtPayload) {
    return this.clubsService.joinClub(clubId, user.sub);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':clubId/leave')
  leave(@Param('clubId') clubId: string, @CurrentUser() user: JwtPayload) {
    return this.clubsService.leaveClub(clubId, user.sub);
  }
}

