import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MawkibFeedbackController } from './mawkib-feedback.controller';
import { MawkibFeedbackService } from './mawkib-feedback.service';

@Module({
  imports: [AuthModule],
  controllers: [MawkibFeedbackController],
  providers: [MawkibFeedbackService],
})
export class MawkibFeedbackModule {}
