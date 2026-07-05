import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CronsService } from './crons.service';

@Controller('crons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.Admin)
export class CronsController {
  constructor(private readonly cronsService: CronsService) {}

  @Get()
  listJobs() {
    return this.cronsService.listJobs();
  }

  @Post(':jobId/run')
  runJob(@Param('jobId') jobId: string) {
    return this.cronsService.runJob(jobId);
  }
}
