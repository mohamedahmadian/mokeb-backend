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
import { UsersService } from './users.service';
import {
  AssignRoleDto,
  CreateQuickPilgrimDto,
  CreateUserDto,
  ListPilgrimsDto,
  ListUsersDto,
  UpdateUserDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @Roles(RoleName.Admin, RoleName.MawkibOwner, RoleName.Pilgrim)
  findMe(@CurrentUser() user: AuthUser) {
    return this.usersService.findOne(user.id);
  }

  @Get('pilgrims')
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  findPilgrims(
    @Query() query: ListPilgrimsDto,
    @CurrentUser() user: AuthUser,
  ) {
    const ownerId = user.roles.includes(RoleName.Admin) ? undefined : user.id;
    return this.usersService.findPilgrims(query, ownerId);
  }

  @Get()
  @Roles(RoleName.Admin)
  findAll(@Query() query: ListUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(RoleName.Admin, RoleName.MawkibOwner, RoleName.Pilgrim)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.findOneForUser(id, user);
  }

  @Post()
  @Roles(RoleName.Admin)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Post('quick-pilgrim')
  @Roles(RoleName.Admin, RoleName.MawkibOwner)
  createQuickPilgrim(@Body() dto: CreateQuickPilgrimDto) {
    return this.usersService.createQuickPilgrim(dto);
  }

  @Patch(':id')
  @Roles(RoleName.Admin, RoleName.MawkibOwner, RoleName.Pilgrim)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.updateForUser(id, dto, user);
  }

  @Delete(':id')
  @Roles(RoleName.Admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Post(':id/roles')
  @Roles(RoleName.Admin)
  assignRole(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignRoleDto) {
    return this.usersService.assignRole(id, dto);
  }

  @Delete(':id/roles/:roleName')
  @Roles(RoleName.Admin)
  removeRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('roleName') roleName: string,
  ) {
    return this.usersService.removeRole(id, roleName);
  }
}
