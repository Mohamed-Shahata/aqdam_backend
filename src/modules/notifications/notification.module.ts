import { Module } from "@nestjs/common";
import { NotificationsGateway } from "./notification.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./notification.entity";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserModule } from "../users/user.module";
import { RedisModule } from "../redis/redis.module";


@Module({
  imports: [
    UserModule,
    RedisModule,
    TypeOrmModule.forFeature([Notification]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: config.get<string>("JWT_EXPIRESIN") }
      })
    })
  ],
  providers: [NotificationsGateway, NotificationService],
  controllers: [NotificationController],
  exports: [NotificationsGateway, NotificationService]
})
export class NotificationModule { }