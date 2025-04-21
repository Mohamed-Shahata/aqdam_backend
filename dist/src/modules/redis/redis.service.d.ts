import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private config;
    private client;
    private subscriber;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getClient(): Redis;
    getSubscriber(): Redis;
    publish(channel: string, message: string): Promise<void>;
    subscribe(channel: string, callback: (message: string) => void): Promise<void>;
    set(key: string, value: string, expirySeconds?: number): Promise<void>;
    get(key: string): Promise<string | null>;
    delete(key: string): Promise<number>;
    deleteByPattern(pattern: string): Promise<void>;
}
