import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api")

  app.enableCors({
    origin: true, // يسمح لأي origin
    credentials: true, // مهم لو بتستخدم كوكيز أو Authorization headers
  });

  app.useGlobalPipes(new ValidationPipe({
    forbidNonWhitelisted: true,
    whitelist: true,
    transform: true
  }))

  await app.listen(5000);
}
bootstrap();
