import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MawkibStatus, RoleName } from '@prisma/client';
import { MawkibsService } from './mawkibs.service';
import {
  CreateMawkibDto,
  SearchMawkibDto,
  UpdateMawkibDto,
} from './dto/mawkib.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@Controller('mawkibs')
export class MawkibsController {
  constructor(private mawkibsService: MawkibsService) {}

  @Get()
  findAll(@Query() search: SearchMawkibDto) {
    return this.mawkibsService.findAll(search);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.Admin)
  findAllAdmin() {
    return this.mawkibsService.findAllAdmin();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.MawkibOwner)
  findMy(@CurrentUser() user: AuthUser) {
    return this.mawkibsService.findByOwner(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mawkibsService.findOne(id);
  }

  @Get(':id/capacity')
  getCapacity(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date?: string,
  ) {
    return this.mawkibsService.getAvailableCapacity(
      id,
      date ? new Date(date) : undefined,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.Admin)
  create(@Body() dto: CreateMawkibDto) {
    return this.mawkibsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.Admin)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMawkibDto) {
    return this.mawkibsService.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.Admin)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: MawkibStatus,
  ) {
    return this.mawkibsService.updateStatus(id, status);
  }
}
