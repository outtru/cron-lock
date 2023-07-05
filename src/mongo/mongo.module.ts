import { Module } from '@nestjs/common';
import { MongoService } from './mongo.service';

@Module({
  providers: [MongoService]
})
export class MongoModule {}
