import { DynamicModule, Module, forwardRef } from "@nestjs/common";
import { CronService } from "./cron.service";
import { SchedulerRegistry } from "@nestjs/schedule";
import { RedisModule } from "../redis/redis.module";
import { MongoModule } from "../mongo/mongo.module";
import { RedisService } from "../redis/redis.service";
import { MongoService } from "../mongo/mongo.service";

@Module({})
export class CronModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      imports: [
        MongoModule.register(options),
        RedisModule.register(options)],
      module: CronModule,
      providers: [
        {
          provide: "CONFIG_OPTIONS",
          useValue: options,
        },
        CronService,
        SchedulerRegistry,
        {
          provide: "MongoService",
          useFactory: async ()=> {
            return await new MongoService(options);
          },
        },
        {
          provide: "RedisService",
          useFactory() {
            return new RedisService(options);
          },
        },
      ],
      exports: [CronService],
    };
  }
}
