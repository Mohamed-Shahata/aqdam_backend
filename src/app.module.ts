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
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

//
@Module({
  imports: [
    AuthModule,
    ScheduleModule.forRoot(),
    UserModule,
    PostModule,
    JobModule,
    NotificationModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 6
      }
    ])
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule { }
