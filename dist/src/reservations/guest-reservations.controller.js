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
exports.GuestReservationsController = void 0;
const common_1 = require("@nestjs/common");
const reservations_service_1 = require("./reservations.service");
const reservation_dto_1 = require("./dto/reservation.dto");
let GuestReservationsController = class GuestReservationsController {
    reservationsService;
    constructor(reservationsService) {
        this.reservationsService = reservationsService;
    }
    createGuest(dto) {
        return this.reservationsService.createGuest(dto);
    }
    track(query) {
        return this.reservationsService.findByTrackingCode(query.trackingCode);
    }
    trackByMobile(query) {
        return this.reservationsService.findRecentByMobileForGuest(query.mobileNumber);
    }
};
exports.GuestReservationsController = GuestReservationsController;
__decorate([
    (0, common_1.Post)('guest'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reservation_dto_1.CreateGuestReservationDto]),
    __metadata("design:returntype", void 0)
], GuestReservationsController.prototype, "createGuest", null);
__decorate([
    (0, common_1.Get)('guest/track'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reservation_dto_1.TrackReservationDto]),
    __metadata("design:returntype", void 0)
], GuestReservationsController.prototype, "track", null);
__decorate([
    (0, common_1.Get)('guest/track-by-mobile'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reservation_dto_1.TrackByMobileDto]),
    __metadata("design:returntype", void 0)
], GuestReservationsController.prototype, "trackByMobile", null);
exports.GuestReservationsController = GuestReservationsController = __decorate([
    (0, common_1.Controller)('reservations'),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], GuestReservationsController);
//# sourceMappingURL=guest-reservations.controller.js.map