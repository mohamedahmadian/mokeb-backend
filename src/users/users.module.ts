import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ServantMawkibAccessService } from './servant-mawkib-access.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ServantMawkibAccessService],
  exports: [UsersService, ServantMawkibAccessService],
})
export class UsersModule {}
