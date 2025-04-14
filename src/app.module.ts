import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './modules/users/user.entity';
import { Post } from './modules/posts/post.entity';
import { Job } from './modules/jobs/job.entity';
import { UserModule } from './modules/users/user.module';
import { PostModule } from './modules/posts/post.module';
import { JobModule } from './modules/jobs/job.module';
import { MulterModule } from '@nestjs/platform-express';


@Module({
  imports: [
    AuthModule,
    UserModule,
    PostModule,
    JobModule,
    MulterModule.register({
      dest: "./images"
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: "postgres",
          username: config.get<string>("DB_USERNAME"),
          database: config.get<string>("DB_NAME"),
          password: config.get<string>("DB_PASSWORD"),
          host: "localhost",
          port: config.get<number>("DB_PORT"),
          synchronize: true,
          entities: [User, Post, Job]
        }
      }
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    })
  ],
})
export class AppModule { }
