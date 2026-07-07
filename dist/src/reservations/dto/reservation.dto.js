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
exports.GuestRecordAttendanceDto = exports.RecordReservationAttendanceDto = exports.ExtendReservationDto = exports.TrackByExactMobileDto = exports.TrackByMobileDto = exports.TrackReservationDto = exports.SearchReservationDto = exports.CancelReservationDto = exports.UpdateReservationStatusDto = exports.CreateGuestReservationDto = exports.CreateReservationDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const reservation_guest_count_util_1 = require("../reservation-guest-count.util");
let HasGuestCountConstraint = class HasGuestCountConstraint {
    validate(_, args) {
        const obj = args.object;
        return (0, reservation_guest_count_util_1.hasGuestCount)(obj.maleGuestCount, obj.femaleGuestCount);
    }
    defaultMessage() {
        return reservation_guest_count_util_1.HAS_GUEST_COUNT_MESSAGE;
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
    pilgrimMobile;
    description;
    travelOrigin;
    companions;
    plannedCheckInTime;
    plannedCheckOutTime;
    skipCapacityCheck;
    trackingCode;
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
    (0, class_validator_1.Validate)(HasGuestCountConstraint),
    __metadata("design:type", Number)
], CreateReservationDto.prototype, "maleGuestCount", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateReservationDto.prototype, "femaleGuestCount", void 0);
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
], CreateReservationDto.prototype, "travelOrigin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "companions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: 'ساعت ورود باید به فرمت HH:mm باشد',
    }),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "plannedCheckInTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: 'ساعت خروج باید به فرمت HH:mm باشد',
    }),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "plannedCheckOutTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateReservationDto.prototype, "skipCapacityCheck", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value !== 'string')
            return undefined;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64, { message: 'کد رزرو حداکثر ۶۴ کاراکتر می‌تواند باشد' }),
    __metadata("design:type", String)
], CreateReservationDto.prototype, "trackingCode", void 0);
class CreateGuestReservationDto {
    firstName;
    lastName;
    mobileNumber;
    province;
    city;
    password;
    nationalId;
    nationalIdCardImageUrl;
    gender;
    birthDate;
    country;
    passportNumber;
    mawkibId;
    reservationDate;
    reservationEndDate;
    maleGuestCount;
    femaleGuestCount;
    description;
    travelOrigin;
    companions;
    plannedCheckInTime;
    plannedCheckOutTime;
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
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(4, { message: 'رمز عبور باید حداقل ۴ کاراکتر باشد' }),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "nationalId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "nationalIdCardImageUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.UserGender),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "passportNumber", void 0);
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
    (0, class_validator_1.Validate)(HasGuestCountConstraint),
    __metadata("design:type", Number)
], CreateGuestReservationDto.prototype, "maleGuestCount", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateGuestReservationDto.prototype, "femaleGuestCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "travelOrigin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "companions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: 'ساعت ورود باید به فرمت HH:mm باشد',
    }),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "plannedCheckInTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):[0-5]\d$/, {
        message: 'ساعت خروج باید به فرمت HH:mm باشد',
    }),
    __metadata("design:type", String)
], CreateGuestReservationDto.prototype, "plannedCheckOutTime", void 0);
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
    createdAtFrom;
    createdAtTo;
    mawkibName;
    sortOrder;
    pilgrimName;
    pilgrimMobile;
    pilgrimNationalId;
    trackingCode;
    lookupQuery;
    pilgrimUserId;
    guestCountMin;
    guestCountMax;
    page;
    pageSize;
    all;
    lookupSingle;
    lookupExact;
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
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SearchReservationDto.prototype, "createdAtFrom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SearchReservationDto.prototype, "createdAtTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], SearchReservationDto.prototype, "mawkibName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['asc', 'desc']),
    __metadata("design:type", String)
], SearchReservationDto.prototype, "sortOrder", void 0);
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
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], SearchReservationDto.prototype, "pilgrimNationalId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], SearchReservationDto.prototype, "trackingCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], SearchReservationDto.prototype, "lookupQuery", void 0);
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
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SearchReservationDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], SearchReservationDto.prototype, "pageSize", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchReservationDto.prototype, "all", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchReservationDto.prototype, "lookupSingle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SearchReservationDto.prototype, "lookupExact", void 0);
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
class TrackByExactMobileDto {
    mobileNumber;
}
exports.TrackByExactMobileDto = TrackByExactMobileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'شماره موبایل الزامی است' }),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], TrackByExactMobileDto.prototype, "mobileNumber", void 0);
class ExtendReservationDto {
    reservationEndDate;
    stayDays;
}
exports.ExtendReservationDto = ExtendReservationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ExtendReservationDto.prototype, "reservationEndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(31),
    __metadata("design:type", Number)
], ExtendReservationDto.prototype, "stayDays", void 0);
class RecordReservationAttendanceDto {
    recordedAt;
}
exports.RecordReservationAttendanceDto = RecordReservationAttendanceDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordReservationAttendanceDto.prototype, "recordedAt", void 0);
class GuestRecordAttendanceDto extends TrackReservationDto {
    recordedAt;
}
exports.GuestRecordAttendanceDto = GuestRecordAttendanceDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GuestRecordAttendanceDto.prototype, "recordedAt", void 0);
//# sourceMappingURL=reservation.dto.js.map