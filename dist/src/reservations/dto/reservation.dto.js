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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackByMobileDto = exports.TrackReservationDto = exports.SearchReservationDto = exports.CancelReservationDto = exports.UpdateReservationStatusDto = exports.CreateGuestReservationDto = exports.CreateReservationDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
let HasGuestCountConstraint = class HasGuestCountConstraint {
    validate(_, args) {
        const obj = args.object;
        return (obj.maleGuestCount ?? 0) + (obj.femaleGuestCount ?? 0) > 0;
    }
    defaultMessage() {
        return 'حداقل یک نفر (آقا یا خانم) باید برای رزرو وارد شود';
    }
};
HasGuestCountConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'hasGuestCount', async: false })
], HasGuestCountConstraint);
class CreateReservationDto {
    mawkibId;
    pilgrimUserId;
    reservationDate;
    reservationEndDate;
    maleGuestCount;
    femaleGuestCount;
    _guestCheck;
    pilgrimMobile;
    description;
    companions;
}
exports.CreateReservationDto = CreateReservationDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateReservationDto.prototype, "mawkibId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateReservationDto.prototype, "pilgrimUserId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "reservationDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "reservationEndDate", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateReservationDto.prototype, "maleGuestCount", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateReservationDto.prototype, "femaleGuestCount", void 0);
__decorate([
    (0, class_validator_1.Validate)(HasGuestCountConstraint),
    __metadata("design:type", void 0)
], CreateReservationDto.prototype, "_guestCheck", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "pilgrimMobile", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "companions", void 0);
class CreateGuestReservationDto {
    firstName;
    lastName;
    mobileNumber;
    province;
    city;
    mawkibId;
    reservationDate;
    reservationEndDate;
    maleGuestCount;
    femaleGuestCount;
    _guestCheck;
    description;
    companions;
}
exports.CreateGuestReservationDto = CreateGuestReservationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "mobileNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "province", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateGuestReservationDto.prototype, "mawkibId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "reservationDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "reservationEndDate", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateGuestReservationDto.prototype, "maleGuestCount", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateGuestReservationDto.prototype, "femaleGuestCount", void 0);
__decorate([
    (0, class_validator_1.Validate)(HasGuestCountConstraint),
    __metadata("design:type", void 0)
], CreateGuestReservationDto.prototype, "_guestCheck", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "companions", void 0);
class UpdateReservationStatusDto {
    status;
}
exports.UpdateReservationStatusDto = UpdateReservationStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ReservationStatus),
    __metadata("design:type", String)
], UpdateReservationStatusDto.prototype, "status", void 0);
class CancelReservationDto {
    note;
}
exports.CancelReservationDto = CancelReservationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelReservationDto.prototype, "note", void 0);
class SearchReservationDto {
    mawkibId;
    status;
    reservationDateFrom;
    reservationDateTo;
    pilgrimName;
    pilgrimMobile;
    pilgrimUserId;
    guestCountMin;
    guestCountMax;
}
exports.SearchReservationDto = SearchReservationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SearchReservationDto.prototype, "mawkibId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ReservationStatus),
    __metadata("design:type", String)
], SearchReservationDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SearchReservationDto.prototype, "reservationDateFrom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SearchReservationDto.prototype, "reservationDateTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchReservationDto.prototype, "pilgrimName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchReservationDto.prototype, "pilgrimMobile", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], SearchReservationDto.prototype, "pilgrimUserId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SearchReservationDto.prototype, "guestCountMin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SearchReservationDto.prototype, "guestCountMax", void 0);
class TrackReservationDto {
    trackingCode;
}
exports.TrackReservationDto = TrackReservationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'کد رزرو الزامی است' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], TrackReservationDto.prototype, "trackingCode", void 0);
class TrackByMobileDto {
    mobileNumber;
}
exports.TrackByMobileDto = TrackByMobileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'شماره موبایل الزامی است' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], TrackByMobileDto.prototype, "mobileNumber", void 0);
//# sourceMappingURL=reservation.dto.js.map