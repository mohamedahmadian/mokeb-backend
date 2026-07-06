import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

function shouldServeFrontend(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.SERVE_FRONTEND === 'true'
  );
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/api/uploads/',
  });

  // app.enableCors({
  //   origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  //   credentials: true,
  // });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  if (shouldServeFrontend()) {
    const publicPath = join(process.cwd(), 'public');

    app.useStaticAssets(publicPath, { index: false });

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
      }
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(join(publicPath, 'index.html'), (err) => {
        if (err) next();
      });
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
