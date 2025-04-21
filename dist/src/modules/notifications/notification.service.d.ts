import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { RedisService } from '../redis/redis.service';
export declare class NotificationService {
    private notificationsRepository;
    private redisService;
    constructor(notificationsRepository: Repository<Notification>, redisService: RedisService);
    getNotifications(userId: number): Promise<any[]>;
    markNotificationAsRead(notificationId: number, userId: number): Promise<void>;
    cacheNotification(notification: Notification): Promise<void>;
}
