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
exports.AttendanceRosterQueryDto = exports.AttendanceRosterKind = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var AttendanceRosterKind;
(function (AttendanceRosterKind) {
    AttendanceRosterKind["ABSENT"] = "absent";
    AttendanceRosterKind["PRESENT"] = "present";
})(AttendanceRosterKind || (exports.AttendanceRosterKind = AttendanceRosterKind = {}));
class AttendanceRosterQueryDto {
    kind;
    mawkibId;
}
exports.AttendanceRosterQueryDto = AttendanceRosterQueryDto;
__decorate([
    (0, class_validator_1.IsEnum)(AttendanceRosterKind),
    __metadata("design:type", String)
], AttendanceRosterQueryDto.prototype, "kind", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AttendanceRosterQueryDto.prototype, "mawkibId", void 0);
//# sourceMappingURL=attendance-roster.dto.js.map