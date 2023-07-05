import { DynamicModule, Module } from "@nestjs/common";
import { RedisService } from "./redis.service";

@Module({})
export class RedisModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module:RedisModule,
      providers: [
        {
          provide: "RedisService",
          useFactory() {
            return new RedisService(options);
          },
        },
      ],
    };
  }
}
