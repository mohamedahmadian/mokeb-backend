import { Module } from '@nestjs/common';
import { RegistrationRequestsService } from './registration-requests.service';
import { RegistrationRequestsController } from './registration-requests.controller';

@Module({
  controllers: [RegistrationRequestsController],
  providers: [RegistrationRequestsService],
})
export class RegistrationRequestsModule {}
