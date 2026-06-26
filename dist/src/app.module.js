"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const mawkibs_module_1 = require("./mawkibs/mawkibs.module");
const reservations_module_1 = require("./reservations/reservations.module");
const registration_requests_module_1 = require("./registration-requests/registration-requests.module");
const honorary_volunteers_module_1 = require("./honorary-volunteers/honorary-volunteers.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const mawkib_feedback_module_1 = require("./mawkib-feedback/mawkib-feedback.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            mawkibs_module_1.MawkibsModule,
            reservations_module_1.ReservationsModule,
            registration_requests_module_1.RegistrationRequestsModule,
            honorary_volunteers_module_1.HonoraryVolunteersModule,
            dashboard_module_1.DashboardModule,
            mawkib_feedback_module_1.MawkibFeedbackModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map