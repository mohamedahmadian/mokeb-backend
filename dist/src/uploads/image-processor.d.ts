import { Jimp } from 'jimp';
type JimpImage = Awaited<ReturnType<typeof Jimp.read>>;
export declare function readImageBuffer(buffer: Buffer): Promise<JimpImage>;
export declare function encodeJpegWithinLimit(source: Buffer, options: {
    maxWidth: number;
    maxBytes: number;
    quality: number;
}): Promise<Buffer>;
export declare function encodeSquareProfileJpeg(source: Buffer, size: number, maxBytes: number): Promise<Buffer>;
export {};
