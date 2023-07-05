import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor(redisConfig: any) {
    let config = {};
    config["port"] = redisConfig.redisPort;
    config["host"] = redisConfig.redisHost;
    config["password"] = redisConfig.redisPassword;
    config["username"] = redisConfig.redisUserName;
    config["tls"] = redisConfig.redisTls;
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
  async del(key: string): Promise<number> {
    return await this.redis.del(key);
  }
}
