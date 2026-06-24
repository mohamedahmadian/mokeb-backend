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
exports.RegistrationRequestsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let RegistrationRequestsService = class RegistrationRequestsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.mawkibRegistrationRequest.findMany({
            include: {
                owner: { select: { id: true, fullName: true, mobileNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    findByOwner(ownerUserId) {
        return this.prisma.mawkibRegistrationRequest.findMany({
            where: { ownerUserId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const request = await this.prisma.mawkibRegistrationRequest.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, fullName: true, mobileNumber: true } },
            },
        });
        if (!request) {
            throw new common_1.NotFoundException('درخواست یافت نشد');
        }
        return request;
    }
    async create(dto, currentUser) {
        return this.prisma.mawkibRegistrationRequest.create({
            data: {
                ...dto,
                ownerUserId: currentUser.id,
            },
        });
    }
    async review(id, status) {
        const request = await this.findOne(id);
        if (request.status !== client_1.RegistrationRequestStatus.Pending) {
            throw new common_1.BadRequestException('این درخواست قبلاً بررسی شده است');
        }
        if (status === 'Rejected') {
            return this.prisma.mawkibRegistrationRequest.update({
                where: { id },
                data: { status: client_1.RegistrationRequestStatus.Rejected },
            });
        }
        const mawkibOwnerRole = await this.prisma.role.findUnique({
            where: { name: client_1.RoleName.MawkibOwner },
        });
        if (!mawkibOwnerRole) {
            throw new common_1.BadRequestException('نقش موکب‌دار یافت نشد');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.userRole.upsert({
                where: {
                    userId_roleId: {
                        userId: request.ownerUserId,
                        roleId: mawkibOwnerRole.id,
                    },
                },
                create: {
                    userId: request.ownerUserId,
                    roleId: mawkibOwnerRole.id,
                },
                update: {},
            });
            const mawkib = await tx.mawkib.create({
                data: {
                    name: request.mawkibName,
                    address: request.address,
                    latitude: request.latitude,
                    longitude: request.longitude,
                    phoneNumber: request.phoneNumber,
                    description: request.description,
                    maleCapacity: request.capacity,
                    femaleCapacity: 0,
                    ownerUserId: request.ownerUserId,
                    status: client_1.MawkibStatus.Approved,
                },
            });
            await tx.mawkibRegistrationRequest.update({
                where: { id },
                data: { status: client_1.RegistrationRequestStatus.Approved },
            });
            return { request, mawkib };
        });
    }
};
exports.RegistrationRequestsService = RegistrationRequestsService;
exports.RegistrationRequestsService = RegistrationRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RegistrationRequestsService);
//# sourceMappingURL=registration-requests.service.js.map