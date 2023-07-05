import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Collection, MongoClient } from "mongodb";
import { isActiveEnum } from "../cron/enums/cron.enums";

@Injectable()
export class MongoService implements OnModuleDestroy {
  private URI: string;
  private client: MongoClient;
  private collection: Collection;
  constructor(mongoConfig: any) {
    this.URI = `${mongoConfig.protocol}://${mongoConfig.username}:${mongoConfig.password}@${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.dbName}`;
    this.client = new MongoClient(this.URI);
    this.setClient(mongoConfig);
  }
  onModuleDestroy() {
    this.client.close();
  }

  async setClient(mongoConfig: any) {
    try {
      let mongoClient = await this.client.connect();
      let db = mongoClient.db(mongoConfig.dbName);
      this.collection = db.collection(mongoConfig.collection);
    } catch (error) {
      console.log(error);
    }
  }
  async findAOne(jobName: string) {
    try {
      const docs = await this.collection.findOne({ cronName: jobName });
      return docs;
    } catch (error) {
      console.log(error);
    }
  }

  async findAll() {
    try {
      const docs = await this.collection.find();
      return docs;
    } catch (error) {
      console.log(error);
    }
  }

  async activateJob(jobName: string) {
    try {
      const docs = await this.collection.findOneAndUpdate(
        { cronName: jobName },
        { status: isActiveEnum.ACTIVE },
        { upsert: true }
      );
      return docs;
    } catch (error) {
      console.log(error);
    }
  }
  async deactivateJob(jobName: string) {
    try {
      const docs = await this.collection.findOneAndUpdate(
        { cronName: jobName },
        { status: isActiveEnum.DEACTIVATE },
        { upsert: true }
      );
      return docs;
    } catch (error) {
      console.log(error);
    }
  }

  async updateJob(jobName: string, job: any) {
    try {
      const docs = await this.collection.findOneAndUpdate(
        { cronName: jobName },
        job,
        { upsert: true }
      );
      return docs;
    } catch (error) {
      console.log(error);
    }
  }
}
