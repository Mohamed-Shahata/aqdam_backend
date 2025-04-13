import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './modules/users/user.entity';


@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRootAsync({
      inject:[ConfigService],
      useFactory: (config:ConfigService) =>{
        return{
          type: "postgres",
          username: config.get<string>("DB_USERNAME"),
          database: config.get<string>("DB_NAME"),
          password: config.get<string>("DB_PASSWORD"),
          host: "localhost",
          port: config.get<number>("DB_PORT"),
          synchronize: true,
          entities:[User]
        }
      }
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    })
  ],
})
export class AppModule {}
