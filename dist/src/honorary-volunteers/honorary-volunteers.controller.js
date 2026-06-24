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
exports.HonoraryVolunteersController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const honorary_volunteers_service_1 = require("./honorary-volunteers.service");
const create_honorary_volunteer_application_dto_1 = require("./dto/create-honorary-volunteer-application.dto");
const create_authenticated_volunteer_application_dto_1 = require("./dto/create-authenticated-volunteer-application.dto");
const create_mawkib_need_dto_1 = require("./dto/create-mawkib-need.dto");
const honorary_volunteer_filters_dto_1 = require("./dto/honorary-volunteer-filters.dto");
const review_honorary_volunteer_application_dto_1 = require("./dto/review-honorary-volunteer-application.dto");
const update_honorary_volunteer_application_dto_1 = require("./dto/update-honorary-volunteer-application.dto");
const track_honorary_volunteer_dto_1 = require("./dto/track-honorary-volunteer.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let HonoraryVolunteersController = class HonoraryVolunteersController {
    service;
    constructor(service) {
        this.service = service;
    }
    findPublicNeeds(filters) {
        return this.service.findPublicNeeds(filters);
    }
    track(query) {
        return this.service.findByTrackingCode(query.trackingCode);
    }
    trackByMobile(query) {
        return this.service.findByMobileForGuest(query.mobileNumber);
    }
    create(dto) {
        return this.service.createVolunteer(dto);
    }
    createOwnerNeed(dto, user) {
        return this.service.createMawkibNeed(dto, user.id);
    }
    createForAuthenticatedUser(dto, user) {
        return this.service.createVolunteerForAuthenticatedUser(dto, user);
    }
    findMy(user) {
        return this.service.findByUser(user);
    }
    findAll(filters) {
        return this.service.findAll(filters);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    updateOwn(id, dto, user) {
        return this.service.updateOwn(id, dto, user);
    }
    cancelOwn(id, user) {
        return this.service.cancelOwn(id, user);
    }
    review(id, dto, user) {
        return this.service.review(id, dto, user.id);
    }
};
exports.HonoraryVolunteersController = HonoraryVolunteersController;
__decorate([
    (0, common_1.Get)('public/needs'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [honorary_volunteer_filters_dto_1.HonoraryVolunteerFiltersDto]),
    __metadata("design:returntype", void 0)
], HonoraryVolunteersController.prototype, "findPublicNeeds", null);
__decorate([
    (0, common_1.Get)('public/track'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [track_honorary_volunteer_dto_1.TrackHonoraryVolunteerDto]),
    __metadata("design:returntype", void 0)
], HonoraryVolunteersController.prototype, "track", null);
__decorate([
    (0, common_1.Get)('public/track-by-mobile'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [track_honorary_volunteer_dto_1.TrackHonoraryVolunteerByMobileDto]),
    __metadata("design:returntype", void 0)
], HonoraryVolunteersController.prototype, "trackByMobile", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_honorary_volunteer_application_dto_1.CreateHonoraryVolunteerApplicationDto]),
    __metadata("design:returntype", void 0)
], HonoraryVolunteersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('owner'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.MawkibOwner, client_1.RoleName.Admin),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mawkib_need_dto_1.CreateMawkibNeedDto, Object]),
    __metadata("design:returntype", void 0)
], HonoraryVolunteersController.prototype, "createOwnerNeed", null);
__decorate([
    (0, common_1.Post)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_authenticated_volunteer_application_dto_1.CreateAuthenticatedVolunteerApplicationDto, Object]),
    __metadata("design:returntype", void 0)
], HonoraryVolunteersController.prototype, "createForAuthenticatedUser", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HonoraryVolunteersController.prototype, "findMy", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Admin, client_1.RoleName.MawkibOwner),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [honorary_volunteer_filters_dto_1.HonoraryVolunteerFiltersDto]),
    __metadata("design:returntype", void 0)
], HonoraryVolunteersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], HonoraryVolunteersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_honorary_volunteer_application_dto_1.UpdateHonoraryVolunteerApplicationDto, Object]),
    __metadata("design:returntype", void 0)
], HonoraryVolunteersController.prototype, "updateOwn", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], HonoraryVolunteersController.prototype, "cancelOwn", null);
__decorate([
    (0, common_1.Patch)(':id/review'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Admin, client_1.RoleName.MawkibOwner),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, review_honorary_volunteer_application_dto_1.ReviewHonoraryVolunteerApplicationDto, Object]),
    __metadata("design:returntype", void 0)
], HonoraryVolunteersController.prototype, "review", null);
exports.HonoraryVolunteersController = HonoraryVolunteersController = __decorate([
    (0, common_1.Controller)('honorary-volunteers'),
    __metadata("design:paramtypes", [honorary_volunteers_service_1.HonoraryVolunteersService])
], HonoraryVolunteersController);
//# sourceMappingURL=honorary-volunteers.controller.js.map