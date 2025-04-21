import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from "compression"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'PATCH', 'POST', 'DELETE', 'PUT'],
    credential: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
    }),
  );
  app.use(compression());

  await app.listen(5000);
}
bootstrap();