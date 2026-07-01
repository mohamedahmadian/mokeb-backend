import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

interface SaveImageOptions {
  subdir: string;
  maxWidth: number;
  maxBytes: number;
  extension: 'jpg' | 'webp';
  quality: number;
}

@Injectable()
export class UploadsService {
  private readonly uploadsRoot = join(process.cwd(), 'uploads');

  async saveNationalIdCard(file?: Express.Multer.File) {
    return this.saveImage(file, {
      subdir: 'national-id-cards',
      maxWidth: 1600,
      maxBytes: 1024 * 1024,
      extension: 'jpg',
      quality: 85,
    });
  }

  async saveMawkibImage(file?: Express.Multer.File) {
    return this.saveImage(file, {
      subdir: 'mawkib-images',
      maxWidth: 1600,
      maxBytes: 800 * 1024,
      extension: 'webp',
      quality: 80,
    });
  }

  async saveProfileImage(file?: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('فایل تصویر ارسال نشده است');
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('فقط فایل تصویری مجاز است');
    }

    const subdir = 'profile-images';
    const maxBytes = 80 * 1024;
    const size = 256;
    const uploadDir = join(this.uploadsRoot, subdir);
    await mkdir(uploadDir, { recursive: true });

    let output = await sharp(file.buffer)
      .rotate()
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .webp({ quality: 80 })
      .toBuffer();

    if (output.length > maxBytes) {
      for (let quality = 72; quality >= 40; quality -= 8) {
        const candidate = await sharp(file.buffer)
          .rotate()
          .resize(size, size, { fit: 'cover', position: 'centre' })
          .webp({ quality })
          .toBuffer();
        output = candidate;
        if (candidate.length <= maxBytes) break;
      }
    }

    const filename = `${randomUUID()}.webp`;
    const absolutePath = join(uploadDir, filename);

    try {
      await writeFile(absolutePath, output);
    } catch {
      throw new InternalServerErrorException('خطا در ذخیره تصویر');
    }

    return {
      url: `/api/uploads/${subdir}/${filename}`,
    };
  }

  private async saveImage(
    file: Express.Multer.File | undefined,
    options: SaveImageOptions,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('فایل تصویر ارسال نشده است');
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('فقط فایل تصویری مجاز است');
    }

    const uploadDir = join(this.uploadsRoot, options.subdir);
    await mkdir(uploadDir, { recursive: true });

    let output = await this.encodeImage(file.buffer, options);

    if (output.length > options.maxBytes) {
      output = await this.compressToMaxSize(file.buffer, options);
    }

    const filename = `${randomUUID()}.${options.extension}`;
    const absolutePath = join(uploadDir, filename);

    try {
      await writeFile(absolutePath, output);
    } catch {
      throw new InternalServerErrorException('خطا در ذخیره تصویر');
    }

    return {
      url: `/api/uploads/${options.subdir}/${filename}`,
    };
  }

  private async encodeImage(input: Buffer, options: SaveImageOptions): Promise<Buffer> {
    const pipeline = sharp(input).rotate().resize({
      width: options.maxWidth,
      withoutEnlargement: true,
    });

    if (options.extension === 'webp') {
      return pipeline.webp({ quality: options.quality }).toBuffer();
    }

    return pipeline.jpeg({ quality: options.quality, mozjpeg: true }).toBuffer();
  }

  private async compressToMaxSize(
    input: Buffer,
    options: SaveImageOptions,
  ): Promise<Buffer> {
    const metadata = await sharp(input).metadata();
    let width = Math.min(metadata.width ?? options.maxWidth, options.maxWidth);

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const quality = Math.max(40, options.quality - attempt * 8);
      const pipeline = sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true });

      const candidate =
        options.extension === 'webp'
          ? await pipeline.webp({ quality }).toBuffer()
          : await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();

      if (candidate.length <= options.maxBytes) {
        return candidate;
      }

      width = Math.floor(width * 0.85);
    }

    const fallbackWidth = Math.max(640, Math.floor(width * 0.75));
    const pipeline = sharp(input)
      .rotate()
      .resize({ width: fallbackWidth, withoutEnlargement: true });

    return options.extension === 'webp'
      ? pipeline.webp({ quality: 45 }).toBuffer()
      : pipeline.jpeg({ quality: 40, mozjpeg: true }).toBuffer();
  }
}
