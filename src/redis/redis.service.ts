import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor(redisConfig: any) {
    let config = {};
    config["port"] = redisConfig.redisPort;
    config["host"] = redisConfig.redisPort;
    config["password"] = redisConfig.redisPort;
    config["username"] = redisConfig.redisPort;
    config["tls"] = redisConfig.redisPort;
    this.redis = new Redis(config);
  }

  async set(key: string, value: string): Promise<string> {
    return await this.redis.set(key, value);
  }

  async setnx(key: string, value: string): Promise<number> {
    return await this.redis.setnx(key, value);
  }
  async get(key: string): Promise<string> {
    return await this.redis.get(key);
  }
}
