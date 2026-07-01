"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readImageBuffer = readImageBuffer;
exports.encodeJpegWithinLimit = encodeJpegWithinLimit;
exports.encodeSquareProfileJpeg = encodeSquareProfileJpeg;
const common_1 = require("@nestjs/common");
const jimp_1 = require("jimp");
async function readImageBuffer(buffer) {
    try {
        return await jimp_1.Jimp.read(buffer);
    }
    catch {
        throw new common_1.BadRequestException('فایل تصویر نامعتبر یا قابل خواندن نیست');
    }
}
function resizeToMaxWidth(image, maxWidth) {
    if (image.width <= maxWidth)
        return;
    image.resize({ w: maxWidth });
}
async function toJpegBuffer(image, quality) {
    return image.getBuffer('image/jpeg', { quality });
}
async function encodeJpegWithinLimit(source, options) {
    const image = await readImageBuffer(source);
    resizeToMaxWidth(image, options.maxWidth);
    for (let attempt = 0; attempt < 10; attempt += 1) {
        const quality = Math.max(40, options.quality - attempt * 8);
        const output = await toJpegBuffer(image, quality);
        if (output.length <= options.maxBytes) {
            return output;
        }
        if (image.width > 320) {
            image.resize({ w: Math.max(320, Math.floor(image.width * 0.85)) });
        }
    }
    return toJpegBuffer(image, 40);
}
async function encodeSquareProfileJpeg(source, size, maxBytes) {
    const image = await readImageBuffer(source);
    image.cover({ w: size, h: size });
    for (let quality = 80; quality >= 40; quality -= 8) {
        const output = await toJpegBuffer(image, quality);
        if (output.length <= maxBytes) {
            return output;
        }
    }
    image.resize({ w: 200, h: 200 });
    return toJpegBuffer(image, 40);
}
//# sourceMappingURL=image-processor.js.map