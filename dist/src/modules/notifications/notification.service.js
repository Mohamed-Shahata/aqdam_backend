"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./notification.entity");
const redis_service_1 = require("../redis/redis.service");
let NotificationService = class NotificationService {
    notificationsRepository;
    redisService;
    constructor(notificationsRepository, redisService) {
        this.notificationsRepository = notificationsRepository;
        this.redisService = redisService;
    }
    async getNotifications(userId) {
        const cacheKey = `notifications:${userId}`;
        const cachedNotifications = await this.redisService.get(cacheKey);
        if (cachedNotifications) {
            try {
                const parsed = JSON.parse(cachedNotifications);
                return Array.isArray(parsed) ? parsed : [];
            }
            catch (error) {
                console.error('Redis cache parse error:', error);
            }
        }
        const notifications = await this.notificationsRepository.find({
            where: { recipient: { id: userId } },
            order: { createdAt: 'DESC' },
            relations: ['recipient', 'post', "job"],
        });
        await this.redisService.set(cacheKey, JSON.stringify(notifications), 300);
        return notifications;
    }
    async markNotificationAsRead(notificationId, userId) {
        const notification = await this.notificationsRepository.findOne({
            where: { id: notificationId },
            relations: ['recipient', 'post', "job"],
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notification not found');
        }
        if (notification.recipient.id !== userId) {
            throw new common_1.UnauthorizedException('You are not authorized to mark this notification as read');
        }
        notification.isRead = true;
        await this.notificationsRepository.save(notification);
        const cacheKey = `notifications:${userId}`;
        const cachedNotifications = await this.redisService.get(cacheKey);
        if (cachedNotifications) {
            let notifications = JSON.parse(cachedNotifications);
            notifications = notifications.map((n) => n.id === notificationId ? { ...n, isRead: true } : n);
            await this.redisService.set(cacheKey, JSON.stringify(notifications), 300);
        }
    }
    async cacheNotification(notification) {
        const userId = notification.recipient.id;
        const cacheKey = `notifications:${userId}`;
        const cachedNotifications = await this.redisService.get(cacheKey);
        let notifications = cachedNotifications ? JSON.parse(cachedNotifications) : [];
        notifications = Array.isArray(notifications) ? notifications : [];
        notifications = [notification, ...notifications];
        await this.redisService.set(cacheKey, JSON.stringify(notifications), 300);
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map