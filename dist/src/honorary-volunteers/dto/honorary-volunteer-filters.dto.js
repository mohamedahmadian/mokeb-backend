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
exports.HonoraryVolunteerFiltersDto = void 0;
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class HonoraryVolunteerFiltersDto {
    status;
    applicantType;
    serviceType;
    mawkibId;
    search;
    availabilityFrom;
    availabilityTo;
    createdFrom;
    createdTo;
}
exports.HonoraryVolunteerFiltersDto = HonoraryVolunteerFiltersDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.HonoraryVolunteerApplicationStatus),
    __metadata("design:type", String)
], HonoraryVolunteerFiltersDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.HonoraryVolunteerApplicantType),
    __metadata("design:type", String)
], HonoraryVolunteerFiltersDto.prototype, "applicantType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.HonoraryVolunteerServiceType),
    __metadata("design:type", String)
], HonoraryVolunteerFiltersDto.prototype, "serviceType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], HonoraryVolunteerFiltersDto.prototype, "mawkibId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    __metadata("design:type", String)
], HonoraryVolunteerFiltersDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], HonoraryVolunteerFiltersDto.prototype, "availabilityFrom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], HonoraryVolunteerFiltersDto.prototype, "availabilityTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], HonoraryVolunteerFiltersDto.prototype, "createdFrom", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], HonoraryVolunteerFiltersDto.prototype, "createdTo", void 0);
//# sourceMappingURL=honorary-volunteer-filters.dto.js.map