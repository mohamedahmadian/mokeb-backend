import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import {
  encodeJpegWithinLimit,
  encodeSquareProfileJpeg,
} from './image-processor';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
]);

interface SaveImageOptions {
  subdir: string;
  maxWidth: number;
  maxBytes: number;
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
      quality: 85,
    });
  }

  async saveMawkibImage(file?: Express.Multer.File) {
    return this.saveImage(file, {
      subdir: 'mawkib-images',
      maxWidth: 1600,
      maxBytes: 800 * 1024,
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
    const uploadDir = join(this.uploadsRoot, subdir);
    await mkdir(uploadDir, { recursive: true });

    const output = await encodeSquareProfileJpeg(file.buffer, 256, 80 * 1024);
    const filename = `${randomUUID()}.jpg`;
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

    const output = await encodeJpegWithinLimit(file.buffer, {
      maxWidth: options.maxWidth,
      maxBytes: options.maxBytes,
      quality: options.quality,
    });

    const filename = `${randomUUID()}.jpg`;
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
}
