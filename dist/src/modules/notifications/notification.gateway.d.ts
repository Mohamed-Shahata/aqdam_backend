import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Post } from '../posts/post.entity';
import { Job } from '../jobs/job.entity';
export declare class NotificationsGateway implements OnModuleInit {
    private redisService;
    server: Server;
    constructor(redisService: RedisService);
    onModuleInit(): Promise<void>;
    sendNotification(userId: number, notification: {
        message: string;
        post?: Post;
        job?: Job;
    }): Promise<void>;
}
