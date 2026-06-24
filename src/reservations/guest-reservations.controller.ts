import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateGuestReservationDto, TrackByMobileDto, TrackReservationDto } from './dto/reservation.dto';

@Controller('reservations')
export class GuestReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post('guest')
  createGuest(@Body() dto: CreateGuestReservationDto) {
    return this.reservationsService.createGuest(dto);
  }

  @Get('guest/track')
  track(@Query() query: TrackReservationDto) {
    return this.reservationsService.findByTrackingCode(query.trackingCode);
  }

  @Get('guest/track-by-mobile')
  trackByMobile(@Query() query: TrackByMobileDto) {
    return this.reservationsService.findRecentByMobileForGuest(query.mobileNumber);
  }
}
