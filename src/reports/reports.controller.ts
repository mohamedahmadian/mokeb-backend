import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.Admin, RoleName.MawkibOwner)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('pilgrims')
  getPilgrimsReport(@CurrentUser() user: AuthUser) {
    return this.reportsService.getPilgrimReport(user);
  }

  @Get('mawkib-owners')
  @Roles(RoleName.Admin)
  getMawkibOwnersReport(@CurrentUser() user: AuthUser) {
    return this.reportsService.getMawkibOwnersReport(user);
  }

  @Get('mawkibs')
  getMawkibsReport(@CurrentUser() user: AuthUser) {
    return this.reportsService.getMawkibsReport(user);
  }

  @Get('reservations')
  getReservationsReport(@CurrentUser() user: AuthUser) {
    return this.reportsService.getReservationsReport(user);
  }
}
