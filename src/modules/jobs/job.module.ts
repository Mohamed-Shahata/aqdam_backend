import { Module } from "@nestjs/common";
import { JobController } from "./job.controller";
import { JobService } from "./job.service";
import { UserModule } from "../users/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { User } from "../users/user.entity";
import { Notification } from "../notifications/notification.entity";
import { NotificationsGateway } from "../notifications/notification.gateway";
import { RedisModule } from "../redis/redis.module";
import { NotificationService } from "../notifications/notification.service";



@Module({
  imports: [
    UserModule,
    RedisModule,
    TypeOrmModule.forFeature([Job, User, Notification]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: config.get<string>("JWT_EXPIRESIN") }
      })
    }),
  ],
  controllers: [JobController],
  providers: [JobService, NotificationsGateway, NotificationService]
})
export class JobModule { };