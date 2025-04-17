import { Module } from "@nestjs/common";
import { JobController } from "./job.controller";
import { JobService } from "./job.service";
import { UserModule } from "../users/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { User } from "../users/user.entity";



@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Job, User]),
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
  providers: [JobService]
})
export class JobModule { };