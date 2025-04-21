import { Module } from "@nestjs/common";
import { PostController } from "./post.controller";
import { PostService } from "./post.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Post } from "./post.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserModule } from "../users/user.module";
import { User } from "../users/user.entity";
import { NotificationService } from "../notifications/notification.service";
import { NotificationsGateway } from "../notifications/notification.gateway";
import { Notification } from "../notifications/notification.entity";
import { RedisModule } from "../redis/redis.module";
import { Reaction } from "./likes.entity";
import { JobModule } from "../jobs/job.module";
import { Job } from "../jobs/job.entity";


@Module({
  imports: [
    UserModule,
    RedisModule,
    JobModule,
    TypeOrmModule.forFeature([Post, User, Notification, Reaction, Job]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: config.get<string>("JWT_EXPIRESIN") }
      })
    })
  ],
  controllers: [PostController],
  providers: [PostService, NotificationService, NotificationsGateway]
})
export class PostModule { };