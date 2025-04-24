import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from "compression"
import * as crypto from 'crypto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");

  app.use(compression())
  app.enableCors({
    origin: 'https://aqdam-git-aqdam-mohameds-projects-f5551999.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 5000, "0.0.0.0");
}
bootstrap();