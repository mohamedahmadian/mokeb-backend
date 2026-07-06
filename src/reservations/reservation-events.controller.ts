import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { RecordReservationEventDto } from './dto/reservation-event.dto';
import { ReservationEventsService } from './reservation-events.service';

@Controller('reservations/:id/events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.Admin, RoleName.MawkibOwner)
export class ReservationEventsController {
  constructor(private readonly eventsService: ReservationEventsService) {}

  @Get()
  list(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.eventsService.listForReservation(id, user);
  }

  @Post()
  record(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordReservationEventDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.eventsService.recordEvent(id, dto, user);
  }
}
