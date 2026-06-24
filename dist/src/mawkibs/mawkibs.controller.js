"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MawkibsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const mawkibs_service_1 = require("./mawkibs.service");
const mawkib_dto_1 = require("./dto/mawkib.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let MawkibsController = class MawkibsController {
    mawkibsService;
    constructor(mawkibsService) {
        this.mawkibsService = mawkibsService;
    }
    findAll(search) {
        return this.mawkibsService.findAll(search);
    }
    findAllAdmin(search) {
        return this.mawkibsService.findAllAdmin(search);
    }
    findMy(user, search) {
        return this.mawkibsService.findByOwner(user.id, search);
    }
    findOnePublic(id) {
        return this.mawkibsService.findOnePublic(id);
    }
    getCapacity(id, date) {
        return this.mawkibsService.getCapacitySnapshot(id, date ? new Date(date) : undefined);
    }
    findOne(id, user) {
        const isAdmin = user.roles.includes(client_1.RoleName.Admin);
        return this.mawkibsService.findOne(id, user.id, isAdmin);
    }
    create(dto) {
        return this.mawkibsService.create(dto);
    }
    update(id, dto, user) {
        const isAdmin = user.roles.includes(client_1.RoleName.Admin);
        return this.mawkibsService.update(id, dto, user.id, isAdmin);
    }
    remove(id) {
        return this.mawkibsService.remove(id);
    }
    updateStatus(id, status) {
        return this.mawkibsService.updateStatus(id, status);
    }
};
exports.MawkibsController = MawkibsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mawkib_dto_1.SearchMawkibDto]),
    __metadata("design:returntype", void 0)
], MawkibsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Admin),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mawkib_dto_1.AdminSearchMawkibDto]),
    __metadata("design:returntype", void 0)
], MawkibsController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.MawkibOwner),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, mawkib_dto_1.AdminSearchMawkibDto]),
    __metadata("design:returntype", void 0)
], MawkibsController.prototype, "findMy", null);
__decorate([
    (0, common_1.Get)('public/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MawkibsController.prototype, "findOnePublic", null);
__decorate([
    (0, common_1.Get)(':id/capacity'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], MawkibsController.prototype, "getCapacity", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Admin, client_1.RoleName.MawkibOwner),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MawkibsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Admin),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mawkib_dto_1.CreateMawkibDto]),
    __metadata("design:returntype", void 0)
], MawkibsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Admin, client_1.RoleName.MawkibOwner),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, mawkib_dto_1.UpdateMawkibDto, Object]),
    __metadata("design:returntype", void 0)
], MawkibsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Admin),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MawkibsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Admin),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], MawkibsController.prototype, "updateStatus", null);
exports.MawkibsController = MawkibsController = __decorate([
    (0, common_1.Controller)('mawkibs'),
    __metadata("design:paramtypes", [mawkibs_service_1.MawkibsService])
], MawkibsController);
//# sourceMappingURL=mawkibs.controller.js.map