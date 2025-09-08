import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './transform.interceptor';
import express from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule,{bodyParser:{limit:'10mb'}});
   app.enableCors({
    origin: (origin, callback) => {
      console.log('CORS Origin:', origin);
      const allowed = [
        'http://192.168.1.7:8080',
        'http://localhost:8080',
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'https://swa-flax.vercel.app'
      ].filter(Boolean);
      if (!origin) return callback(null, true);
      return allowed.includes(origin) ? callback(null, true) : callback(null, false);
    },
    credentials: true,
  });

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }));
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.PORT || 3001;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '192.168.1.7';
  await app.listen(port, host);
  console.log(`Server running on http://${host}:${port}`);
}
bootstrap();