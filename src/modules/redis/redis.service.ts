import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private subscriber: Redis;

  constructor(private config: ConfigService) {
    const redisOptions = {
      host: this.config.get<string>("REDIS_HOST"),
      port: this.config.get<number>("REDIS_PORT"),
    };

    this.client = new Redis(redisOptions);
    this.subscriber = new Redis(redisOptions);
  }

  async onModuleInit() {
    await this.client.ping();
    await this.subscriber.ping();
    console.log("Connected to Redis");
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.subscriber.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  async publish(channel: string, message: string) {
    await this.client.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void) {
    await this.subscriber.subscribe(channel);
    this.subscriber.on("message", (ch, message) => {
      if (ch === channel) {
        callback(message);
      }
    });
  }

  async set(key: string, value: string, expirySeconds?: number) {
    if (expirySeconds) {
      await this.client.set(key, value, "EX", expirySeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async delete(key: string) {
    return this.client.del(key)
  }

  async deleteByPattern(pattern: string): Promise<void> {
    const stream = this.client.scanStream({
      match: pattern,
      count: 100, // عدد المفاتيح اللي بتتفحص في كل دفعة
    });

    return new Promise<void>((resolve, reject) => {
      stream.on("data", async (keys: string[]) => {
        if (keys.length > 0) {
          try {
            // حذف المفاتيح باستخدام DEL
            await this.client.del(...keys);
          } catch (error) {
            console.error(`Error deleting keys for pattern ${pattern}:`, error);
            reject(error);
          }
        }
      });

      stream.on("end", () => {
        // الـ scan خلّص
        resolve();
      });

      stream.on("error", (error) => {
        // معالجة أي أخطاء أثناء الـ scan
        console.error(`Error scanning keys for pattern ${pattern}:`, error);
        reject(error);
      });
    });
  }
}
