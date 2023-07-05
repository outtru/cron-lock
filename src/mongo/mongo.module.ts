import { DynamicModule, Module } from "@nestjs/common";
import { MongoService } from "./mongo.service";

@Module({})
export class MongoModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module:MongoModule,
      providers: [
        {
          provide: "MongoService",
          useFactory() {
            return new MongoService(options);
          },
        },
      ],
    };
  }
}
