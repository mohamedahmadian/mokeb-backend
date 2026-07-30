import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { UpsertUserFastReceptionPatternDto } from './dto/upsert-user-fast-reception-pattern.dto';
import { FastReceptionPatternService } from './fast-reception-pattern.service';

@Controller('fast-reception-pattern')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.Admin, RoleName.MawkibOwner, RoleName.MawkibServant)
export class FastReceptionPatternController {
  constructor(private service: FastReceptionPatternService) {}

  @Get('me')
  getMine(@CurrentUser() user: AuthUser) {
    return this.service.getMine(user);
  }

  @Put('me')
  upsertMine(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpsertUserFastReceptionPatternDto,
  ) {
    return this.service.upsertMine(user, dto);
  }
}
