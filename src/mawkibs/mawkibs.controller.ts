import {
  Body,
  Controller,
  Delete,
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
  AdminSearchMawkibDto,
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
  findAllAdmin(@Query() search: AdminSearchMawkibDto) {
    return this.mawkibsService.findAllAdmin(search);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.MawkibOwner)
  findMy(@CurrentUser() user: AuthUser, @Query() search: AdminSearchMawkibDto) {
    return this.mawkibsService.findByOwner(user.id, search);
  }

  @Get('public/:id')
  findOnePublic(@Param('id', ParseIntPipe) id: number) {
    return this.mawkibsService.findOnePublic(id);
  }

  @Get(':id/capacity')
  getCapacity(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date?: string,
  ) {
    return this.mawkibsService.getCapacitySnapshot(
      id,
      date ? new Date(date) : undefined,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = user.roles.includes(RoleName.Admin);
    return this.mawkibsService.findOne(id, user.id, isAdmin);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  create(@Body() dto: CreateMawkibDto, @CurrentUser() user: AuthUser) {
    const isAdmin = user.roles.includes(RoleName.Admin);
    return this.mawkibsService.create(dto, user.id, isAdmin);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMawkibDto,
    @CurrentUser() user: AuthUser,
  ) {
    const isAdmin = user.roles.includes(RoleName.Admin);
    return this.mawkibsService.update(id, dto, user.id, isAdmin);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.Admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mawkibsService.remove(id);
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
