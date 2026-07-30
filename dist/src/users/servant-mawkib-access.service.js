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
exports.ServantMawkibAccessService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let ServantMawkibAccessService = class ServantMawkibAccessService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAccessibleMawkibIds(servantUserId) {
        const user = await this.prisma.user.findFirst({
            where: {
                id: servantUserId,
                isActive: true,
                roles: { some: { role: { name: client_1.RoleName.MawkibServant } } },
            },
            select: {
                servantAllMawkibsAccess: true,
                servantOwnerUserId: true,
                servantMawkibId: true,
                mawkibServantAccesses: { select: { mawkibId: true } },
                servantMawkib: { select: { ownerUserId: true } },
            },
        });
        if (!user) {
            return [];
        }
        const ownerUserId = user.servantOwnerUserId ?? user.servantMawkib?.ownerUserId ?? null;
        if (user.servantAllMawkibsAccess && ownerUserId != null) {
            const mawkibs = await this.prisma.mawkib.findMany({
                where: { ownerUserId },
                select: { id: true },
            });
            return mawkibs.map((m) => m.id);
        }
        const ids = new Set(user.mawkibServantAccesses.map((row) => row.mawkibId));
        if (user.servantMawkibId != null) {
            ids.add(user.servantMawkibId);
        }
        return [...ids];
    }
    async hasAccess(servantUserId, mawkibId) {
        const ids = await this.getAccessibleMawkibIds(servantUserId);
        return ids.includes(mawkibId);
    }
};
exports.ServantMawkibAccessService = ServantMawkibAccessService;
exports.ServantMawkibAccessService = ServantMawkibAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServantMawkibAccessService);
//# sourceMappingURL=servant-mawkib-access.service.js.map