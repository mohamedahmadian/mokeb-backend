"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const crypto_1 = require("crypto");
const sharp_1 = __importDefault(require("sharp"));
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
]);
let UploadsService = class UploadsService {
    uploadsRoot = (0, path_1.join)(process.cwd(), 'uploads');
    async saveNationalIdCard(file) {
        return this.saveImage(file, {
            subdir: 'national-id-cards',
            maxWidth: 1600,
            maxBytes: 1024 * 1024,
            extension: 'jpg',
            quality: 85,
        });
    }
    async saveMawkibImage(file) {
        return this.saveImage(file, {
            subdir: 'mawkib-images',
            maxWidth: 1600,
            maxBytes: 800 * 1024,
            extension: 'webp',
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
        const maxBytes = 80 * 1024;
        const size = 256;
        const uploadDir = (0, path_1.join)(this.uploadsRoot, subdir);
        await (0, promises_1.mkdir)(uploadDir, { recursive: true });
        let output = await (0, sharp_1.default)(file.buffer)
            .rotate()
            .resize(size, size, { fit: 'cover', position: 'centre' })
            .webp({ quality: 80 })
            .toBuffer();
        if (output.length > maxBytes) {
            for (let quality = 72; quality >= 40; quality -= 8) {
                const candidate = await (0, sharp_1.default)(file.buffer)
                    .rotate()
                    .resize(size, size, { fit: 'cover', position: 'centre' })
                    .webp({ quality })
                    .toBuffer();
                output = candidate;
                if (candidate.length <= maxBytes)
                    break;
            }
        }
        const filename = `${(0, crypto_1.randomUUID)()}.webp`;
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
        let output = await this.encodeImage(file.buffer, options);
        if (output.length > options.maxBytes) {
            output = await this.compressToMaxSize(file.buffer, options);
        }
        const filename = `${(0, crypto_1.randomUUID)()}.${options.extension}`;
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
    async encodeImage(input, options) {
        const pipeline = (0, sharp_1.default)(input).rotate().resize({
            width: options.maxWidth,
            withoutEnlargement: true,
        });
        if (options.extension === 'webp') {
            return pipeline.webp({ quality: options.quality }).toBuffer();
        }
        return pipeline.jpeg({ quality: options.quality, mozjpeg: true }).toBuffer();
    }
    async compressToMaxSize(input, options) {
        const metadata = await (0, sharp_1.default)(input).metadata();
        let width = Math.min(metadata.width ?? options.maxWidth, options.maxWidth);
        for (let attempt = 0; attempt < 8; attempt += 1) {
            const quality = Math.max(40, options.quality - attempt * 8);
            const pipeline = (0, sharp_1.default)(input)
                .rotate()
                .resize({ width, withoutEnlargement: true });
            const candidate = options.extension === 'webp'
                ? await pipeline.webp({ quality }).toBuffer()
                : await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
            if (candidate.length <= options.maxBytes) {
                return candidate;
            }
            width = Math.floor(width * 0.85);
        }
        const fallbackWidth = Math.max(640, Math.floor(width * 0.75));
        const pipeline = (0, sharp_1.default)(input)
            .rotate()
            .resize({ width: fallbackWidth, withoutEnlargement: true });
        return options.extension === 'webp'
            ? pipeline.webp({ quality: 45 }).toBuffer()
            : pipeline.jpeg({ quality: 40, mozjpeg: true }).toBuffer();
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)()
], UploadsService);
//# sourceMappingURL=uploads.service.js.map