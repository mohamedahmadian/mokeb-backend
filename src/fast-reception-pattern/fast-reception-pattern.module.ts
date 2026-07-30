import { Module } from '@nestjs/common';
import { FastReceptionPatternController } from './fast-reception-pattern.controller';
import { FastReceptionPatternService } from './fast-reception-pattern.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [FastReceptionPatternController],
  providers: [FastReceptionPatternService],
})
export class FastReceptionPatternModule {}
