import { Module } from '@nestjs/common';
import { MawkibsModule } from '../mawkibs/mawkibs.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [MawkibsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
