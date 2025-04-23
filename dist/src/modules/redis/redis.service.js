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
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = class RedisService {
    config;
    client;
    subscriber;
    constructor(config) {
        this.config = config;
        const redisUrl = this.config.get('REDIS_URL');
        if (!redisUrl) {
            throw new Error('REDIS_URL is not defined in .env file');
        }
        this.client = new ioredis_1.default(redisUrl);
        this.subscriber = new ioredis_1.default(redisUrl);
    }
    async onModuleInit() {
        await this.client.ping();
        await this.subscriber.ping();
    }
    async onModuleDestroy() {
        await this.client.quit();
        await this.subscriber.quit();
    }
    getClient() {
        return this.client;
    }
    getSubscriber() {
        return this.subscriber;
    }
    async publish(channel, message) {
        await this.client.publish(channel, message);
    }
    async subscribe(channel, callback) {
        await this.subscriber.subscribe(channel);
        this.subscriber.on("message", (ch, message) => {
            if (ch === channel) {
                callback(message);
            }
        });
    }
    async set(key, value, expirySeconds) {
        if (expirySeconds) {
            await this.client.set(key, value, "EX", expirySeconds);
        }
        else {
            await this.client.set(key, value);
        }
    }
    async get(key) {
        return this.client.get(key);
    }
    async delete(key) {
        return this.client.del(key);
    }
    async deleteByPattern(pattern) {
        const stream = this.client.scanStream({
            match: pattern,
            count: 100,
        });
        return new Promise((resolve, reject) => {
            stream.on("data", async (keys) => {
                if (keys.length > 0) {
                    try {
                        await this.client.del(...keys);
                    }
                    catch (error) {
                        console.error(`Error deleting keys for pattern ${pattern}:`, error);
                        reject(error);
                    }
                }
            });
            stream.on("end", () => {
                resolve();
            });
            stream.on("error", (error) => {
                console.error(`Error scanning keys for pattern ${pattern}:`, error);
                reject(error);
            });
        });
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map