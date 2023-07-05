import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Collection, MongoClient } from "mongodb";
import { isActiveEnum } from "../cron/enums/cron.enums";

@Injectable()
export class MongoService implements OnModuleDestroy {
  private URI: string;
  private client: MongoClient;
  private collection: Collection;
  private mongoConfig: any;
  constructor(mongoConfig: any) {
    this.mongoConfig = mongoConfig;
    this.URI = `${mongoConfig.protocol}://${mongoConfig.username}:${mongoConfig.password}@${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.dbName}`;
    this.client = new MongoClient(this.URI);
  }
  onModuleDestroy() {
    this.client.close();
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
      let mongoClient = await this.client.connect();
      this.collection = mongoClient
        .db()
        .collection(this.mongoConfig.collection);
      const docs = await this.collection.find({}).toArray();
      let array = [];
      await docs.forEach((doc) => {
        array.push(doc);
      });
      mongoClient.close();
      console.log(array);
      return array;
    } catch (error) {
      console.log(error);
    }
  }

  async activateJob(jobName: string) {
    try {
      let mongoClient = await this.client.connect();
      this.collection = mongoClient
        .db()
        .collection(this.mongoConfig.collection);
      const docs = await this.collection.findOneAndUpdate(
        { cronName: jobName },
        { $set: { status: isActiveEnum.ACTIVE } },
        { upsert: true }
      );
      return docs;
    } catch (error) {
      console.log(error);
    }
  }
  async deactivateJob(jobName: string) {
    try {
      console.log("here");
      let mongoClient = await this.client.connect();
      this.collection = mongoClient
        .db()
        .collection(this.mongoConfig.collection);
      const docs = await this.collection.findOneAndUpdate(
        { cronName: jobName },
        { $set: { status: isActiveEnum.DEACTIVATE } },
        {
          upsert: true,
        }
      );
      setTimeout(()=>{

        mongoClient.close();
      },1000);
      return docs;
    } catch (error) {
      console.log(error);
    }
  }

  async updateJob(jobName: string, job: any) {
    try {
      let mongoClient = await this.client.connect();
      this.collection = mongoClient
        .db()
        .collection(this.mongoConfig.collection);
      const docs = await this.collection.findOneAndUpdate(
        { cronName: jobName },
        { $set: job },
        { upsert: true }
      );
      setTimeout(()=>{
        mongoClient.close();
      },1000);
      return docs;
    } catch (error) {
      console.log(error);
    }
  }
}
