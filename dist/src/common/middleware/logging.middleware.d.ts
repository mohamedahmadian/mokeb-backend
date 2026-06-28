import { NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
export declare class LoggingMiddleware implements NestMiddleware {
    private readonly logger;
    use(req: Request, res: Response, next: NextFunction): void;
}
