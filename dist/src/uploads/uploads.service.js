"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const crypto_1 = require("crypto");
const image_processor_1 = require("./image-processor");
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
]);
let UploadsService = class UploadsService {
    uploadsRoot = (0, path_1.join)(process.cwd(), 'uploads');
    async saveNationalIdCard(file) {
        return this.saveImage(file, {
            subdir: 'national-id-cards',
            maxWidth: 1600,
            maxBytes: 1024 * 1024,
            quality: 85,
        });
    }
    async saveMawkibImage(file) {
        return this.saveImage(file, {
            subdir: 'mawkib-images',
            maxWidth: 1600,
            maxBytes: 800 * 1024,
            quality: 80,
        });
    }
    async saveProfileImage(file) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('فایل تصویر ارسال نشده است');
        }
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            throw new common_1.BadRequestException('فقط فایل تصویری مجاز است');
        }
        const subdir = 'profile-images';
        const uploadDir = (0, path_1.join)(this.uploadsRoot, subdir);
        await (0, promises_1.mkdir)(uploadDir, { recursive: true });
        const output = await (0, image_processor_1.encodeSquareProfileJpeg)(file.buffer, 256, 80 * 1024);
        const filename = `${(0, crypto_1.randomUUID)()}.jpg`;
        const absolutePath = (0, path_1.join)(uploadDir, filename);
        try {
            await (0, promises_1.writeFile)(absolutePath, output);
        }
        catch {
            throw new common_1.InternalServerErrorException('خطا در ذخیره تصویر');
        }
        return {
            url: `/api/uploads/${subdir}/${filename}`,
        };
    }
    async saveImage(file, options) {
        if (!file?.buffer?.length) {
            throw new common_1.BadRequestException('فایل تصویر ارسال نشده است');
        }
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            throw new common_1.BadRequestException('فقط فایل تصویری مجاز است');
        }
        const uploadDir = (0, path_1.join)(this.uploadsRoot, options.subdir);
        await (0, promises_1.mkdir)(uploadDir, { recursive: true });
        const output = await (0, image_processor_1.encodeJpegWithinLimit)(file.buffer, {
            maxWidth: options.maxWidth,
            maxBytes: options.maxBytes,
            quality: options.quality,
        });
        const filename = `${(0, crypto_1.randomUUID)()}.jpg`;
        const absolutePath = (0, path_1.join)(uploadDir, filename);
        try {
            await (0, promises_1.writeFile)(absolutePath, output);
        }
        catch {
            throw new common_1.InternalServerErrorException('خطا در ذخیره تصویر');
        }
        return {
            url: `/api/uploads/${options.subdir}/${filename}`,
        };
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)()
], UploadsService);
//# sourceMappingURL=uploads.service.js.map