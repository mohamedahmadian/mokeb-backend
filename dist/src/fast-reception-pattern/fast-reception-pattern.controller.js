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
exports.FastReceptionPatternController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const upsert_user_fast_reception_pattern_dto_1 = require("./dto/upsert-user-fast-reception-pattern.dto");
const fast_reception_pattern_service_1 = require("./fast-reception-pattern.service");
let FastReceptionPatternController = class FastReceptionPatternController {
    service;
    constructor(service) {
        this.service = service;
    }
    getMine(user) {
        return this.service.getMine(user);
    }
    upsertMine(user, dto) {
        return this.service.upsertMine(user, dto);
    }
};
exports.FastReceptionPatternController = FastReceptionPatternController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FastReceptionPatternController.prototype, "getMine", null);
__decorate([
    (0, common_1.Put)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upsert_user_fast_reception_pattern_dto_1.UpsertUserFastReceptionPatternDto]),
    __metadata("design:returntype", void 0)
], FastReceptionPatternController.prototype, "upsertMine", null);
exports.FastReceptionPatternController = FastReceptionPatternController = __decorate([
    (0, common_1.Controller)('fast-reception-pattern'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.RoleName.Admin, client_1.RoleName.MawkibOwner, client_1.RoleName.MawkibServant),
    __metadata("design:paramtypes", [fast_reception_pattern_service_1.FastReceptionPatternService])
], FastReceptionPatternController);
//# sourceMappingURL=fast-reception-pattern.controller.js.map