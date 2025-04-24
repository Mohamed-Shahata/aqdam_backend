import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/users/user.module';
import { PostModule } from './modules/posts/post.module';
import { JobModule } from './modules/jobs/job.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { dataSourceOptions } from 'db/data-source';
import { ScheduleModule } from '@nestjs/schedule';

//
@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    PostModule,
    JobModule,
    NotificationModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    })
  ],
})
export class AppModule { }
