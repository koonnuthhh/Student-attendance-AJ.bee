import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Allow multiple origins for mobile (Expo) and web development
  app.enableCors({
    origin: [
      'http://localhost:8081',      // Expo web
      'exp://localhost:8081',       // Expo native
      'http://localhost:19006',     // Alternative Expo web port
      'http://localhost:19000',     // Expo DevTools
      process.env.FRONTEND_URL,     // Custom frontend URL from env
    ].filter(Boolean),               // Remove undefined values
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}/api`);
}
bootstrap();
