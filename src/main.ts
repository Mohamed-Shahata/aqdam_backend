import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");

  app.enableCors({
    origin: '*',  // يسمح لكل الدومينات
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],  // يحدد الطرق المسموح بها
    allowedHeaders: ['Content-Type', 'Authorization'],  // يحدد الهيدرات المسموح بها
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 5000);
}
bootstrap();