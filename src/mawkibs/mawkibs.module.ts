import { Module } from '@nestjs/common';
import { MawkibsService } from './mawkibs.service';
import { MawkibsController } from './mawkibs.controller';

@Module({
  controllers: [MawkibsController],
  providers: [MawkibsService],
  exports: [MawkibsService],
})
export class MawkibsModule {}
