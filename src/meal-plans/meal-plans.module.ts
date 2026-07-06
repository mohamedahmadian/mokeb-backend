import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MawkibsModule } from '../mawkibs/mawkibs.module';
import { MealPlansController } from './meal-plans.controller';
import { MealPlansService } from './meal-plans.service';

@Module({
  imports: [AuthModule, MawkibsModule],
  controllers: [MealPlansController],
  providers: [MealPlansService],
  exports: [MealPlansService],
})
export class MealPlansModule {}
