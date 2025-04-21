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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
let NotificationsGateway = class NotificationsGateway {
    redisService;
    server;
    constructor(redisService) {
        this.redisService = redisService;
    }
    async onModuleInit() {
        this.server.on('connection', (socket) => {
            socket.on('join', (userId) => {
                console.log(`Client ${socket.id} joined for user:${userId}`);
                this.redisService.subscribe(`user:${userId}`, (message) => {
                    try {
                        const notification = JSON.parse(message);
                        if (notification && notification.message && notification.jobId) {
                            socket.emit('notification', notification);
                        }
                        else {
                            console.warn('Invalid notification format:', notification);
                        }
                    }
                    catch (error) {
                        console.error('Error parsing Redis message:', error);
                    }
                });
            });
        });
    }
    async sendNotification(userId, notification) {
        if (!notification || !notification.message || !(notification.post || notification.job)) {
            console.warn('Invalid notification data:', notification);
            return;
        }
        return await this.redisService.publish(`user:${userId}`, JSON.stringify(notification));
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
exports.NotificationsGateway = NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: 'http://localhost:3000', credentials: true } }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], NotificationsGateway);
//# sourceMappingURL=notification.gateway.js.map