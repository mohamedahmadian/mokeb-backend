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
import { RoleName } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { MawkibFeedbackService } from './mawkib-feedback.service';
import { CreateMawkibFeedbackDto } from './dto/create-mawkib-feedback.dto';
import { MawkibFeedbackFiltersDto } from './dto/mawkib-feedback-filters.dto';
import { ReplyMawkibFeedbackDto } from './dto/reply-mawkib-feedback.dto';
import { UpdateMawkibFeedbackDto } from './dto/update-mawkib-feedback.dto';

@Controller('mawkib-feedback')
@UseGuards(JwtAuthGuard)
export class MawkibFeedbackController {
  constructor(private service: MawkibFeedbackService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.Pilgrim)
  create(@Body() dto: CreateMawkibFeedbackDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin)
  findAllAdmin(@Query() filters: MawkibFeedbackFiltersDto) {
    return this.service.findAllAdmin(filters);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Pilgrim)
  findMine(@Query() filters: MawkibFeedbackFiltersDto, @CurrentUser() user: AuthUser) {
    return this.service.findMine(filters, user);
  }

  @Get('inbox')
  @UseGuards(RolesGuard)
  @Roles(RoleName.MawkibOwner)
  findForOwner(@Query() filters: MawkibFeedbackFiltersDto, @CurrentUser() user: AuthUser) {
    return this.service.findForOwner(filters, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Pilgrim)
  updateOwn(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMawkibFeedbackDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateOwn(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.Pilgrim)
  deleteOwn(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.service.deleteOwn(id, user);
  }

  @Patch(':id/reply')
  @UseGuards(RolesGuard)
  @Roles(RoleName.MawkibOwner, RoleName.Admin)
  reply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplyMawkibFeedbackDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.reply(id, dto, user);
  }
}
