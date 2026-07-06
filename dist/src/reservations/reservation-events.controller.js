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
exports.ReservationEventsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const reservation_event_dto_1 = require("./dto/reservation-event.dto");
const reservation_events_service_1 = require("./reservation-events.service");
let ReservationEventsController = class ReservationEventsController {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    list(id, user) {
        return this.eventsService.listForReservation(id, user);
    }
    record(id, dto, user) {
        return this.eventsService.recordEvent(id, dto, user);
    }
};
exports.ReservationEventsController = ReservationEventsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ReservationEventsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, reservation_event_dto_1.RecordReservationEventDto, Object]),
    __metadata("design:returntype", void 0)
], ReservationEventsController.prototype, "record", null);
exports.ReservationEventsController = ReservationEventsController = __decorate([
    (0, common_1.Controller)('reservations/:id/events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Admin, client_1.RoleName.MawkibOwner),
    __metadata("design:paramtypes", [reservation_events_service_1.ReservationEventsService])
], ReservationEventsController);
//# sourceMappingURL=reservation-events.controller.js.map