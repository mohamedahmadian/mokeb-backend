"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronsModule = void 0;
const common_1 = require("@nestjs/common");
const crons_controller_1 = require("./crons.controller");
const crons_service_1 = require("./crons.service");
let CronsModule = class CronsModule {
};
exports.CronsModule = CronsModule;
exports.CronsModule = CronsModule = __decorate([
    (0, common_1.Module)({
        controllers: [crons_controller_1.CronsController],
        providers: [crons_service_1.CronsService],
        exports: [crons_service_1.CronsService],
    })
], CronsModule);
//# sourceMappingURL=crons.module.js.map