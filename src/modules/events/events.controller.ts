import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { RsvpDto } from './dto/rsvp.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    create(@Body() dto: CreateEventDto, @CurrentUser() user: JwtPayload) {
        return this.eventsService.createEvent(user.sub, dto);
    }

    @Get()
    list(@Query() query: EventQueryDto) {
        return this.eventsService.listEvents(query);
    }

    @Get('my/participating')
    getParticipating(@CurrentUser() user: JwtPayload) {
        return this.eventsService.getParticipatingEvents(user.sub);
    }

    @Get(':id')
    getById(@Param('id') id: string) {
        return this.eventsService.getEventById(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateEventDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.eventsService.updateEvent(id, user.sub, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
        return this.eventsService.deleteEvent(id, user.sub);
    }

    @HttpCode(HttpStatus.OK)
    @Post(':id/rsvp')
    rsvp(
        @Param('id') id: string,
        @Body() dto: RsvpDto,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.eventsService.rsvp(id, user.sub, dto);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id/rsvp')
    cancelRsvp(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
        return this.eventsService.cancelRsvp(id, user.sub);
    }
}
