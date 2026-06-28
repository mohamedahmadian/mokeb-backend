"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MawkibsModule = void 0;
const common_1 = require("@nestjs/common");
const mawkibs_service_1 = require("./mawkibs.service");
const mawkibs_controller_1 = require("./mawkibs.controller");
const mawkib_inventory_service_1 = require("./mawkib-inventory.service");
let MawkibsModule = class MawkibsModule {
};
exports.MawkibsModule = MawkibsModule;
exports.MawkibsModule = MawkibsModule = __decorate([
    (0, common_1.Module)({
        controllers: [mawkibs_controller_1.MawkibsController],
        providers: [mawkibs_service_1.MawkibsService, mawkib_inventory_service_1.MawkibInventoryService],
        exports: [mawkibs_service_1.MawkibsService, mawkib_inventory_service_1.MawkibInventoryService],
    })
], MawkibsModule);
//# sourceMappingURL=mawkibs.module.js.map