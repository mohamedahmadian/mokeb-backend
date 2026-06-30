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
exports.UpdateReservationDeliveredItemDto = exports.CreateReservationDeliveredItemDto = void 0;
const class_validator_1 = require("class-validator");
class CreateReservationDeliveredItemDto {
    itemName;
    quantity;
    description;
}
exports.CreateReservationDeliveredItemDto = CreateReservationDeliveredItemDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'نام کالا نامعتبر است' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'نام کالا الزامی است' }),
    (0, class_validator_1.MaxLength)(200, { message: 'نام کالا نباید بیشتر از ۲۰۰ کاراکتر باشد' }),
    __metadata("design:type", String)
], CreateReservationDeliveredItemDto.prototype, "itemName", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'تعداد نامعتبر است' }),
    (0, class_validator_1.Min)(1, { message: 'تعداد باید حداقل ۱ باشد' }),
    __metadata("design:type", Number)
], CreateReservationDeliveredItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'توضیحات نامعتبر است' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'توضیحات نباید بیشتر از ۱۰۰۰ کاراکتر باشد' }),
    __metadata("design:type", String)
], CreateReservationDeliveredItemDto.prototype, "description", void 0);
class UpdateReservationDeliveredItemDto extends CreateReservationDeliveredItemDto {
}
exports.UpdateReservationDeliveredItemDto = UpdateReservationDeliveredItemDto;
//# sourceMappingURL=reservation-delivered-item.dto.js.map