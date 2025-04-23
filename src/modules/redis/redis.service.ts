import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private subscriber: Redis;

  constructor(private config: ConfigService) {
    const redisUrl = this.config.get<string>('REDIS_URL');

    if (!redisUrl) {
      throw new Error('REDIS_URL غير معرف في ملف .env');
    }

    this.client = new Redis(redisUrl, {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
    });
    this.subscriber = new Redis(redisUrl, {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
    });
  }

  async onModuleInit() {
    try {
      await Promise.all([this.client.ping(), this.subscriber.ping()]);
    } catch (error) {
      console.error('فشل الاتصال بـ Redis:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await Promise.all([this.client.quit(), this.subscriber.quit()]);
    } catch (error) {
      console.error('فشل قطع الاتصال بـ Redis:', error);
    }
  }

  getClient(): Redis {
    return this.client;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  async publish(channel: string, message: string): Promise<void> {
    try {
      await this.client.publish(channel, message);
    } catch (error) {
      console.error(`فشل النشر على القناة ${channel}:`, error);
      throw error;
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on("message", (ch, message) => {
        if (ch === channel) {
          callback(message);
        }
      });
    } catch (error) {
      console.error(`فشل الاشتراك في القناة ${channel}:`, error);
      throw error;
    }
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    try {
      if (expirySeconds) {
        await this.client.set(key, value, "EX", expirySeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error(`فشل تعيين المفتاح ${key}:`, error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`فشل جلب المفتاح ${key}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error(`فشل حذف المفتاح ${key}:`, error);
      throw error;
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    const stream = this.client.scanStream({
      match: pattern,
      count: 100,
    });

    return new Promise<void>((resolve, reject) => {
      stream.on("data", async (keys: string[]) => {
        if (keys.length > 0) {
          try {
            await this.client.del(...keys);
          } catch (error) {
            console.error(`فشل حذف المفاتيح بالنمط ${pattern}:`, error);
            reject(error);
          }
        }
      });

      stream.on("end", () => {
        resolve();
      });

      stream.on("error", (error) => {
        console.error(`خطأ أثناء فحص المفاتيح بالنمط ${pattern}:`, error);
        reject(error);
      });
    });
  }
}