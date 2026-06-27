"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const fs_1 = require("fs");
const path_1 = require("path");
const prisma = new client_1.PrismaClient();
function assertIranLocationsFile() {
    const filePath = (0, path_1.join)(__dirname, '..', 'data', 'iran-locations.json');
    if (!(0, fs_1.existsSync)(filePath)) {
        throw new Error('Missing backend/data/iran-locations.json — province/city lists depend on this file');
    }
    const parsed = JSON.parse((0, fs_1.readFileSync)(filePath, 'utf-8'));
    if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Invalid backend/data/iran-locations.json');
    }
    console.log(`Iran locations file OK (${parsed.length} provinces)`);
}
async function main() {
    assertIranLocationsFile();
    const roles = ['Admin', 'Pilgrim', 'MawkibOwner', 'HonoraryServant'];
    for (const name of roles) {
        await prisma.role.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
    const pilgrimRole = await prisma.role.findUnique({ where: { name: 'Pilgrim' } });
    if (!adminRole || !pilgrimRole) {
        throw new Error('Roles not found');
    }
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { mobileNumber: '09120000000' },
        update: {},
        create: {
            fullName: 'مدیر سیستم',
            mobileNumber: '09120000000',
            passwordHash,
            province: 'تهران',
            city: 'تهران',
            roles: {
                create: [{ roleId: adminRole.id }],
            },
        },
    });
    console.log('Seed completed:', { adminId: admin.id });
    console.log('Admin login: 09120000000 / admin123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map