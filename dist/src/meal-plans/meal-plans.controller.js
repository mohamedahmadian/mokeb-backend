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
exports.MealPlansController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const meal_plan_dto_1 = require("./dto/meal-plan.dto");
const present_attendees_report_dto_1 = require("./dto/present-attendees-report.dto");
const meal_plans_service_1 = require("./meal-plans.service");
let MealPlansController = class MealPlansController {
    service;
    constructor(service) {
        this.service = service;
    }
    presentAttendeesReport(query, user) {
        return this.service.getPresentAttendeesReport(query, user);
    }
    findByReservation(reservationId, user) {
        return this.service.findByReservation(reservationId, user);
    }
    generate(reservationId, user) {
        return this.service.generateForReservation(reservationId, user);
    }
    save(reservationId, dto, user) {
        return this.service.saveForReservation(reservationId, dto, user);
    }
    upsertEntry(reservationId, dto, user) {
        return this.service.upsertMealEntry(reservationId, dto, user);
    }
    addDay(reservationId, dto, user) {
        return this.service.addDay(reservationId, dto, user);
    }
    removeDay(reservationId, date, user) {
        return this.service.removeDay(reservationId, date, user);
    }
    markServed(id, user) {
        return this.service.markServed(id, user);
    }
};
exports.MealPlansController = MealPlansController;
__decorate([
    (0, common_1.Get)('reports/present-attendees'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [present_attendees_report_dto_1.PresentAttendeesReportQueryDto, Object]),
    __metadata("design:returntype", void 0)
], MealPlansController.prototype, "presentAttendeesReport", null);
__decorate([
    (0, common_1.Get)('reservation/:reservationId'),
    __param(0, (0, common_1.Param)('reservationId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MealPlansController.prototype, "findByReservation", null);
__decorate([
    (0, common_1.Post)('reservation/:reservationId/generate'),
    __param(0, (0, common_1.Param)('reservationId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MealPlansController.prototype, "generate", null);
__decorate([
    (0, common_1.Put)('reservation/:reservationId'),
    __param(0, (0, common_1.Param)('reservationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, meal_plan_dto_1.SaveMealPlansDto, Object]),
    __metadata("design:returntype", void 0)
], MealPlansController.prototype, "save", null);
__decorate([
    (0, common_1.Patch)('reservation/:reservationId/entry'),
    __param(0, (0, common_1.Param)('reservationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, meal_plan_dto_1.UpsertMealPlanEntryDto, Object]),
    __metadata("design:returntype", void 0)
], MealPlansController.prototype, "upsertEntry", null);
__decorate([
    (0, common_1.Post)('reservation/:reservationId/days'),
    __param(0, (0, common_1.Param)('reservationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, meal_plan_dto_1.AddMealPlanDayDto, Object]),
    __metadata("design:returntype", void 0)
], MealPlansController.prototype, "addDay", null);
__decorate([
    (0, common_1.Delete)('reservation/:reservationId/days/:date'),
    __param(0, (0, common_1.Param)('reservationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('date')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], MealPlansController.prototype, "removeDay", null);
__decorate([
    (0, common_1.Patch)(':id/serve'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], MealPlansController.prototype, "markServed", null);
exports.MealPlansController = MealPlansController = __decorate([
    (0, common_1.Controller)('meal-plans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Admin, client_1.RoleName.MawkibOwner),
    __metadata("design:paramtypes", [meal_plans_service_1.MealPlansService])
], MealPlansController);
//# sourceMappingURL=meal-plans.controller.js.map