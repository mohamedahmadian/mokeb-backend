"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MawkibFeedbackModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const mawkib_feedback_controller_1 = require("./mawkib-feedback.controller");
const mawkib_feedback_service_1 = require("./mawkib-feedback.service");
let MawkibFeedbackModule = class MawkibFeedbackModule {
};
exports.MawkibFeedbackModule = MawkibFeedbackModule;
exports.MawkibFeedbackModule = MawkibFeedbackModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [mawkib_feedback_controller_1.MawkibFeedbackController],
        providers: [mawkib_feedback_service_1.MawkibFeedbackService],
    })
], MawkibFeedbackModule);
//# sourceMappingURL=mawkib-feedback.module.js.map