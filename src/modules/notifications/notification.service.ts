import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private redisService: RedisService,
  ) { }

  async getNotifications(userId: number) {
    const cacheKey = `notifications:${userId}`;
    const cachedNotifications = await this.redisService.get(cacheKey);
    if (cachedNotifications) {
      try {
        const parsed = JSON.parse(cachedNotifications);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('Redis cache parse error:', error);
      }
    }

    const notifications = await this.notificationsRepository.find({
      where: { recipient: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['recipient'],
    });

    await this.redisService.set(cacheKey, JSON.stringify(notifications), 300);
    return notifications;
  }

  async markNotificationAsRead(notificationId: number, userId: number) {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId },
      relations: ['recipient'],
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.recipient.id !== userId) {
      throw new UnauthorizedException('You are not authorized to mark this notification as read');
    }

    notification.isRead = true;
    await this.notificationsRepository.save(notification);

    // Update Redis cache
    const cacheKey = `notifications:${userId}`;
    const cachedNotifications = await this.redisService.get(cacheKey);
    if (cachedNotifications) {
      let notifications = JSON.parse(cachedNotifications);
      notifications = notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      await this.redisService.set(cacheKey, JSON.stringify(notifications), 300);
    }
  }

  async cacheNotification(notification: Notification) {
    const userId = notification.recipient.id;
    const cacheKey = `notifications:${userId}`;
    const cachedNotifications = await this.redisService.get(cacheKey);
    let notifications = cachedNotifications ? JSON.parse(cachedNotifications) : [];
    notifications = Array.isArray(notifications) ? notifications : [];
    notifications = [notification, ...notifications];
    await this.redisService.set(cacheKey, JSON.stringify(notifications), 300);
  }
}