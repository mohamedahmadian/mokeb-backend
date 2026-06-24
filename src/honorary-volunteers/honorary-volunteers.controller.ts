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
import { RoleName } from '@prisma/client';
import { HonoraryVolunteersService } from './honorary-volunteers.service';
import { CreateHonoraryVolunteerApplicationDto } from './dto/create-honorary-volunteer-application.dto';
import { CreateAuthenticatedVolunteerApplicationDto } from './dto/create-authenticated-volunteer-application.dto';
import { CreateMawkibNeedDto } from './dto/create-mawkib-need.dto';
import { HonoraryVolunteerFiltersDto } from './dto/honorary-volunteer-filters.dto';
import { ReviewHonoraryVolunteerApplicationDto } from './dto/review-honorary-volunteer-application.dto';
import { UpdateHonoraryVolunteerApplicationDto } from './dto/update-honorary-volunteer-application.dto';
import {
  TrackHonoraryVolunteerByMobileDto,
  TrackHonoraryVolunteerDto,
} from './dto/track-honorary-volunteer.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@Controller('honorary-volunteers')
export class HonoraryVolunteersController {
  constructor(private service: HonoraryVolunteersService) {}

  @Get('public/needs')
  findPublicNeeds(@Query() filters: HonoraryVolunteerFiltersDto) {
    return this.service.findPublicNeeds(filters);
  }

  @Get('public/track')
  track(@Query() query: TrackHonoraryVolunteerDto) {
    return this.service.findByTrackingCode(query.trackingCode);
  }

  @Get('public/track-by-mobile')
  trackByMobile(@Query() query: TrackHonoraryVolunteerByMobileDto) {
    return this.service.findByMobileForGuest(query.mobileNumber);
  }

  @Post()
  create(@Body() dto: CreateHonoraryVolunteerApplicationDto) {
    return this.service.createVolunteer(dto);
  }

  @Post('owner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.MawkibOwner, RoleName.Admin)
  createOwnerNeed(
    @Body() dto: CreateMawkibNeedDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createMawkibNeed(dto, user.id);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  createForAuthenticatedUser(
    @Body() dto: CreateAuthenticatedVolunteerApplicationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createVolunteerForAuthenticatedUser(dto, user);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMy(@CurrentUser() user: AuthUser) {
    return this.service.findByUser(user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  findAll(@Query() filters: HonoraryVolunteerFiltersDto) {
    return this.service.findAll(filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateOwn(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHonoraryVolunteerApplicationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateOwn(id, dto, user);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelOwn(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.service.cancelOwn(id, user);
  }

  @Patch(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewHonoraryVolunteerApplicationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.review(id, dto, user.id);
  }
}
