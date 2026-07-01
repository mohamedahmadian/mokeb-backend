import { BadRequestException } from '@nestjs/common';
import { Jimp } from 'jimp';

type JimpImage = Awaited<ReturnType<typeof Jimp.read>>;

export async function readImageBuffer(buffer: Buffer): Promise<JimpImage> {
  try {
    return await Jimp.read(buffer);
  } catch {
    throw new BadRequestException('فایل تصویر نامعتبر یا قابل خواندن نیست');
  }
}

function resizeToMaxWidth(image: JimpImage, maxWidth: number): void {
  if (image.width <= maxWidth) return;
  image.resize({ w: maxWidth });
}

async function toJpegBuffer(image: JimpImage, quality: number): Promise<Buffer> {
  return image.getBuffer('image/jpeg', { quality });
}

export async function encodeJpegWithinLimit(
  source: Buffer,
  options: { maxWidth: number; maxBytes: number; quality: number },
): Promise<Buffer> {
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

export async function encodeSquareProfileJpeg(
  source: Buffer,
  size: number,
  maxBytes: number,
): Promise<Buffer> {
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
