import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({ cors: { origin: 'http://localhost:3000', credentials: true } })
@Injectable()
export class NotificationsGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(private redisService: RedisService) { }

  async onModuleInit() {
    this.server.on('connection', (socket) => {
      socket.on('join', (userId: number) => {
        console.log(`Client ${socket.id} joined for user:${userId}`);
        this.redisService.subscribe(`user:${userId}`, (message) => {
          try {
            const notification = JSON.parse(message);
            if (notification && notification.message && notification.jobId) {
              socket.emit('notification', notification);
            } else {
              console.warn('Invalid notification format:', notification);
            }
          } catch (error) {
            console.error('Error parsing Redis message:', error);
          }
        });
      });
    });
  }

  async sendNotification(userId: number, notification: { message: string; jobId: number }) {
    if (!notification || !notification.message || !notification.jobId) {
      console.warn('Invalid notification data:', notification);
      return;
    }
    await this.redisService.publish(`user:${userId}`, JSON.stringify(notification));
  }
}