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
exports.MawkibFeedbackController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const mawkib_feedback_service_1 = require("./mawkib-feedback.service");
const create_mawkib_feedback_dto_1 = require("./dto/create-mawkib-feedback.dto");
const mawkib_feedback_filters_dto_1 = require("./dto/mawkib-feedback-filters.dto");
const reply_mawkib_feedback_dto_1 = require("./dto/reply-mawkib-feedback.dto");
const update_mawkib_feedback_dto_1 = require("./dto/update-mawkib-feedback.dto");
let MawkibFeedbackController = class MawkibFeedbackController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto, user) {
        return this.service.create(dto, user);
    }
    findAllAdmin(filters) {
        return this.service.findAllAdmin(filters);
    }
    findMine(filters, user) {
        return this.service.findMine(filters, user);
    }
    findForOwner(filters, user) {
        return this.service.findForOwner(filters, user);
    }
    findOne(id, user) {
        return this.service.findOne(id, user);
    }
    updateOwn(id, dto, user) {
        return this.service.updateOwn(id, dto, user);
    }
    deleteOwn(id, user) {
        return this.service.deleteOwn(id, user);
    }
    reply(id, dto, user) {
        return this.service.reply(id, dto, user);
    }
};
exports.MawkibFeedbackController = MawkibFeedbackController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Pilgrim),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mawkib_feedback_dto_1.CreateMawkibFeedbackDto, Object]),
    __metadata("design:returntype", void 0)
], MawkibFeedbackController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Admin),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mawkib_feedback_filters_dto_1.MawkibFeedbackFiltersDto]),
    __metadata("design:returntype", void 0)
], MawkibFeedbackController.prototype, "findAllAdmin", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Pilgrim),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mawkib_feedback_filters_dto_1.MawkibFeedbackFiltersDto, Object]),
    __metadata("design:returntype", void 0)
], MawkibFeedbackController.prototype, "findMine", null);
__decorate([
    (0, common_1.Get)('inbox'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.MawkibOwner),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [mawkib_feedback_filters_dto_1.MawkibFeedbackFiltersDto, Object]),
    __metadata("design:returntype", void 0)
], MawkibFeedbackController.prototype, "findForOwner", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MawkibFeedbackController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Pilgrim),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_mawkib_feedback_dto_1.UpdateMawkibFeedbackDto, Object]),
    __metadata("design:returntype", void 0)
], MawkibFeedbackController.prototype, "updateOwn", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Pilgrim),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MawkibFeedbackController.prototype, "deleteOwn", null);
__decorate([
    (0, common_1.Patch)(':id/reply'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.MawkibOwner, client_1.RoleName.Admin),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, reply_mawkib_feedback_dto_1.ReplyMawkibFeedbackDto, Object]),
    __metadata("design:returntype", void 0)
], MawkibFeedbackController.prototype, "reply", null);
exports.MawkibFeedbackController = MawkibFeedbackController = __decorate([
    (0, common_1.Controller)('mawkib-feedback'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [mawkib_feedback_service_1.MawkibFeedbackService])
], MawkibFeedbackController);
//# sourceMappingURL=mawkib-feedback.controller.js.map