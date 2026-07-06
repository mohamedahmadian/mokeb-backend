import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { GuestReservationsController } from './guest-reservations.controller';
import { ReservationEventsController } from './reservation-events.controller';
import { ReservationEventsService } from './reservation-events.service';
import { MawkibsModule } from '../mawkibs/mawkibs.module';
import { UsersModule } from '../users/users.module';
import { MealPlansModule } from '../meal-plans/meal-plans.module';

@Module({
  imports: [MawkibsModule, UsersModule, MealPlansModule],
  controllers: [
    GuestReservationsController,
    ReservationsController,
    ReservationEventsController,
  ],
  providers: [ReservationsService, ReservationEventsService],
  exports: [ReservationsService, ReservationEventsService],
})
export class ReservationsModule {}
