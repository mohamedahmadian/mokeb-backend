import { Module } from '@nestjs/common';
import { MawkibsService } from './mawkibs.service';
import { MawkibsController } from './mawkibs.controller';
import { MawkibInventoryService } from './mawkib-inventory.service';

@Module({
  controllers: [MawkibsController],
  providers: [MawkibsService, MawkibInventoryService],
  exports: [MawkibsService, MawkibInventoryService],
})
export class MawkibsModule {}
