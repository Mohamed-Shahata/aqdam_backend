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
}
