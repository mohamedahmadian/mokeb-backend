import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MawkibsModule } from './mawkibs/mawkibs.module';
import { ReservationsModule } from './reservations/reservations.module';
import { RegistrationRequestsModule } from './registration-requests/registration-requests.module';
import { HonoraryVolunteersModule } from './honorary-volunteers/honorary-volunteers.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MawkibsModule,
    ReservationsModule,
    RegistrationRequestsModule,
    HonoraryVolunteersModule,
    DashboardModule,
  ],
})
export class AppModule {}
