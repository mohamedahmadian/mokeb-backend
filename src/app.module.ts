import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MawkibsModule } from './mawkibs/mawkibs.module';
import { ReservationsModule } from './reservations/reservations.module';
import { RegistrationRequestsModule } from './registration-requests/registration-requests.module';
import { HonoraryVolunteersModule } from './honorary-volunteers/honorary-volunteers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MawkibFeedbackModule } from './mawkib-feedback/mawkib-feedback.module';
import { LocationsModule } from './locations/locations.module';
import { UploadsModule } from './uploads/uploads.module';
import { ReportsModule } from './reports/reports.module';
import { CronsModule } from './crons/crons.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    MawkibsModule,
    ReservationsModule,
    RegistrationRequestsModule,
    HonoraryVolunteersModule,
    DashboardModule,
    MawkibFeedbackModule,
    LocationsModule,
    UploadsModule,
    ReportsModule,
    CronsModule,
    MealPlansModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
