import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import {
  CreateGuestReservationDto,
  GuestRecordAttendanceDto,
  TrackByExactMobileDto,
  TrackReservationDto,
} from './dto/reservation.dto';

@Controller('reservations')
export class GuestReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post('guest')
  createGuest(@Body() dto: CreateGuestReservationDto) {
    return this.reservationsService.createGuest(dto);
  }

  @Post('guest/check-in')
  checkInGuest(@Body() body: GuestRecordAttendanceDto) {
    return this.reservationsService.checkInGuest(body.trackingCode, body);
  }

  @Post('guest/check-out')
  checkOutGuest(@Body() body: GuestRecordAttendanceDto) {
    return this.reservationsService.checkOutGuest(body.trackingCode, body);
  }

  @Get('guest/track')
  track(@Query() query: TrackReservationDto) {
    return this.reservationsService.findByTrackingCode(query.trackingCode);
  }

  @Get('guest/track-by-exact-mobile')
  trackByExactMobile(@Query() query: TrackByExactMobileDto) {
    return this.reservationsService.findRecentByExactMobileForGuest(
      query.mobileNumber,
    );
  }
}
