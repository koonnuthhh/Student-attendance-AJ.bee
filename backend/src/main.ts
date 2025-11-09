import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Allow multiple origins for mobile (Expo) and web development
  app.enableCors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      // Allow any localhost or 127.0.0.1 origin for development
      if (origin.startsWith('http://localhost:') || 
          origin.startsWith('http://127.0.0.1:') ||
          origin.startsWith('exp://localhost:') ||
          origin.startsWith('exp://127.0.0.1:')) {
        return callback(null, true);
      }
      
      // Allow specific origins
      const allowedOrigins = [
        'http://localhost:8081',      // Expo web
        'exp://localhost:8081',       // Expo native
        'http://localhost:19006',     // Alternative Expo web port
        'http://localhost:19000',     // Expo DevTools
        'http://localhost:8080',      // Alternative development port
        'http://127.0.0.1:8081',      // Alternative localhost format
        'http://127.0.0.1:19006',     // Alternative localhost format
        process.env.FRONTEND_URL,     // Custom frontend URL from env
      ].filter(Boolean);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
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
