import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HonoraryVolunteersController } from './honorary-volunteers.controller';
import { HonoraryVolunteersService } from './honorary-volunteers.service';

@Module({
  imports: [AuthModule],
  controllers: [HonoraryVolunteersController],
  providers: [HonoraryVolunteersService],
})
export class HonoraryVolunteersModule {}
