import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { GuestReservationsController } from './guest-reservations.controller';
import { MawkibsModule } from '../mawkibs/mawkibs.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MawkibsModule, UsersModule],
  controllers: [GuestReservationsController, ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
