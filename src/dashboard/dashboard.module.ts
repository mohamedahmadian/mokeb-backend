import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { MawkibsModule } from '../mawkibs/mawkibs.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MawkibsModule, UsersModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
