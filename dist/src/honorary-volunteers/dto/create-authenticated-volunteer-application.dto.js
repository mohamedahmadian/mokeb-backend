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
exports.CreateAuthenticatedVolunteerApplicationDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
class CreateAuthenticatedVolunteerApplicationDto {
    mawkibId;
    description;
    serviceTypes;
    serviceDescription;
    availabilityStartDate;
    availabilityEndDate;
    availabilityDescription;
}
exports.CreateAuthenticatedVolunteerApplicationDto = CreateAuthenticatedVolunteerApplicationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateAuthenticatedVolunteerApplicationDto.prototype, "mawkibId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuthenticatedVolunteerApplicationDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'حداقل یک حوزه خدمت باید انتخاب شود' }),
    (0, class_validator_1.IsEnum)(client_1.HonoraryVolunteerServiceType, { each: true }),
    __metadata("design:type", Array)
], CreateAuthenticatedVolunteerApplicationDto.prototype, "serviceTypes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuthenticatedVolunteerApplicationDto.prototype, "serviceDescription", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAuthenticatedVolunteerApplicationDto.prototype, "availabilityStartDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAuthenticatedVolunteerApplicationDto.prototype, "availabilityEndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuthenticatedVolunteerApplicationDto.prototype, "availabilityDescription", void 0);
//# sourceMappingURL=create-authenticated-volunteer-application.dto.js.map