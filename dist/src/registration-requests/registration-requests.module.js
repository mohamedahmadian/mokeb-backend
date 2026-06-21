"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const registration_requests_service_1 = require("./registration-requests.service");
const registration_requests_controller_1 = require("./registration-requests.controller");
let RegistrationRequestsModule = class RegistrationRequestsModule {
};
exports.RegistrationRequestsModule = RegistrationRequestsModule;
exports.RegistrationRequestsModule = RegistrationRequestsModule = __decorate([
    (0, common_1.Module)({
        controllers: [registration_requests_controller_1.RegistrationRequestsController],
        providers: [registration_requests_service_1.RegistrationRequestsService],
    })
], RegistrationRequestsModule);
//# sourceMappingURL=registration-requests.module.js.map