import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from "compression"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");

  app.use(compression());
  app.enableCors({
    origin: '*',
    methods: ['GET', 'PATCH', 'POST', 'DELETE', 'PUT']
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