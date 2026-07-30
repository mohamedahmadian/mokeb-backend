import { Module } from '@nestjs/common';
import { MawkibsService } from './mawkibs.service';
import { MawkibsController } from './mawkibs.controller';
import { MawkibInventoryService } from './mawkib-inventory.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [MawkibsController],
  providers: [MawkibsService, MawkibInventoryService],
  exports: [MawkibsService, MawkibInventoryService],
})
export class MawkibsModule {}
