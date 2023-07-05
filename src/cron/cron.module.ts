import { DynamicModule, Module } from "@nestjs/common";
import { CronService } from "./cron.service";
import { SchedulerRegistry } from "@nestjs/schedule";

@Module({})
export class CronModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module: CronModule,
      providers: [
        {
          provide: "CONFIG_OPTIONS",
          useValue: options,
        },
        CronService,
        SchedulerRegistry,
      ],
      exports: [CronService],
    };
  }
}
