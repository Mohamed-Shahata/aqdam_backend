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


@Module({
  imports: [
    UserModule,
    RedisModule,
    TypeOrmModule.forFeature([Post, User, Notification]),
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