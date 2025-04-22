import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as compression from "compression"
import * as cors from "cors"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");

  app.use(compression())
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
  });

  // app.use(cors({
  //   origin: 'https://aqdem-git-aqdam-mohameds-projects-f5551999.vercel.app',
  //   methods: "GET, POST, PUT, PATCH, DELETE",
  //   credentials: true
  // }));


  // app.use((req, res, next) => {
  //   res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // نفس ال origin اللي في cors
  //   // res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5501"); // نفس ال origin اللي في cors
  //   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  //   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  //   res.header("Access-Control-Allow-Credentials", "true");

  //   if (req.method === "OPTIONS") {
  //     return res.sendStatus(200);
  //   }

  //   next();
  // });

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
