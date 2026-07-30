import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
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
  PilgrimListScope,
  UpdateUserDto,
} from './dto/user.dto';
import {
  CreateServantDto,
  ListServantsDto,
  UpdateServantDto,
  UpdateServantMawkibAccessDto,
} from './dto/servant.dto';
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
  @Roles(
    RoleName.Admin,
    RoleName.MawkibOwner,
    RoleName.Pilgrim,
    RoleName.HonoraryServant,
    RoleName.MawkibServant,
  )
  findMe(@CurrentUser() user: AuthUser) {
    return this.usersService.findOne(user.id);
  }

  @Get('servants')
  @Roles(RoleName.MawkibOwner)
  findServants(
    @Query() query: ListServantsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.findServantsForOwner(user.id, query);
  }

  @Get('servants/:id/mawkib-access')
  @Roles(RoleName.MawkibOwner)
  getServantMawkibAccess(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.getServantMawkibAccessForOwner(id, user.id);
  }

  @Put('servants/:id/mawkib-access')
  @Roles(RoleName.MawkibOwner)
  updateServantMawkibAccess(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServantMawkibAccessDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.updateServantMawkibAccessForOwner(id, dto, user.id);
  }

  @Get('servants/:id')
  @Roles(RoleName.MawkibOwner)
  findServant(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.getServantForOwner(id, user.id);
  }

  @Post('servants')
  @Roles(RoleName.MawkibOwner)
  createServant(
    @Body() dto: CreateServantDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.createServantForOwner(dto, user.id);
  }

  @Patch('servants/:id')
  @Roles(RoleName.MawkibOwner)
  updateServant(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServantDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.updateServantForOwner(id, dto, user.id);
  }

  @Delete('servants/:id')
  @Roles(RoleName.MawkibOwner)
  removeServant(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.usersService.removeServantForOwner(id, user.id);
  }

  @Get('pilgrims')
  @Roles(RoleName.Admin, RoleName.MawkibOwner, RoleName.MawkibServant)
  findPilgrims(
    @Query() query: ListPilgrimsDto,
    @CurrentUser() user: AuthUser,
  ) {
    const scope = query.scope ?? PilgrimListScope.Mine;
    const isAdmin = user.roles.includes(RoleName.Admin);
    const isServant = user.roles.includes(RoleName.MawkibServant);
    const ownerId =
      !isAdmin && !isServant && scope === PilgrimListScope.Mine
        ? user.id
        : undefined;
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
  @Roles(RoleName.Admin, RoleName.MawkibOwner, RoleName.MawkibServant)
  createQuickPilgrim(@Body() dto: CreateQuickPilgrimDto) {
    return this.usersService.createQuickPilgrim(dto);
  }

  @Patch(':id')
  @Roles(
    RoleName.Admin,
    RoleName.MawkibOwner,
    RoleName.Pilgrim,
    RoleName.MawkibServant,
  )
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
