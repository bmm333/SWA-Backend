import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './transform.interceptor';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: { limit: '10mb' } });
  
  // Trust proxy for Railway
  app.set('trust proxy', true);

  app.enableCors({
    origin: (origin, callback) => {
      console.log('CORS Origin:', origin);
      const allowed = [
        'http://192.168.1.7:8080',
        'http://localhost:8080',
        'http://localhost:3000',
        'https://swa-flax.vercel.app',
        process.env.FRONTEND_URL
      ].filter(Boolean);
      
      if (!origin) return callback(null, true);
      return allowed.includes(origin) ? callback(null, true) : callback(new Error('Not allowed by CORS'), false);
    },
    credentials: false,
  });

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }));
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.PORT || 8080;
  const host = '0.0.0.0';
  
  await app.listen(port, host);
  console.log(`Server running on http://${host}:${port}`);
}

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully'); 
  process.exit(0);
});

bootstrap().catch(error => {
  console.error('Application failed to start:', error);
  process.exit(1);
});