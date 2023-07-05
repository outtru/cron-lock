import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CronJob } from 'cron';
import { CreateCron } from './interfaces/create-cron.interface';
import { RequestMethodEnum, isActiveEnum } from './enums/cron.enums';
import { Redis } from 'ioredis';
import axios, { AxiosRequestConfig } from 'axios';
import { SchedulerRegistry } from '@nestjs/schedule';
import { MongoService } from '../mongo/mongo.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CronService implements OnModuleInit {

    // private readonly redis: Redis;

    @Inject(SchedulerRegistry) private schedulerRegistry:SchedulerRegistry;
    @Inject('MongoService') private mongoService:MongoService;
    @Inject('RedisService') private redisService: RedisService;
    constructor(
        @Inject('CONFIG_OPTIONS') private options: Record<string, any>
    ) { }
    onModuleInit() {
        this.scheduleCronJobsInit()
    }
    
    async scheduleCronJobsInit(){
        try {
            const cronDocs=  await this.mongoService.findAll();
            cronDocs.forEach((job) => {
                const newJob = new CronJob(job.cronTime, async () => {
                    if (job.status.toUpperCase() != isActiveEnum.ACTIVE) { return; }
                    const lockKey: string = `cron-lock:${job.cronName}`;
                    console.log(lockKey);
                    const lockAcquired: number = await this.redisService.setnx(lockKey, '1');
                    if (lockAcquired === 0) return;
                    try {
                        let axiosRequestConfig: AxiosRequestConfig;
                        switch (job.cronMethod.toUpperCase()) {
                            case RequestMethodEnum.GET:
                                axiosRequestConfig = {        
                                    headers: {
                                        ...job.cronHeaders
                                    }
                                }
                                axios.get(job.cronUrl, axiosRequestConfig)
                                break;
                            case RequestMethodEnum.POST:
                                axiosRequestConfig = {
                                    headers: {
                                        ...job.cronHeaders
                                    }
                                }
                                axios.post(job.cronUrl, job.cronBody, axiosRequestConfig);
                                break;
                            default:
                                break;
                        }
                    } finally {
                        await this.redisService.del(lockKey);
                    }
                });
                this.schedulerRegistry.addCronJob(job.cronName, newJob);
                newJob.start();

            });
        } catch (error) {
            return;
        }
    }
    async scheduleCronJobs(cronObject: Array<CreateCron>) {
        try {
            cronObject.forEach((job) => {
                const newJob = new CronJob(job.cronTime, async () => {
                    if (job.status.toUpperCase() != isActiveEnum.ACTIVE) { return; }
                    const lockKey: string = `cron-lock:${job.cronName}`;
                    const lockAcquired: number = await this.redisService.setnx(lockKey, '1');
                    if (lockAcquired === 0) return;
                    try {
                        let axiosRequestConfig: AxiosRequestConfig;
                        switch (job.cronMethod.toUpperCase()) {
                            case RequestMethodEnum.GET:
                                axiosRequestConfig = {
                                    headers: {
                                        ...job.cronHeaders
                                    }
                                }
                                axios.get(job.cronUrl, axiosRequestConfig)
                                break;
                            case RequestMethodEnum.POST:
                                axiosRequestConfig = {
                                    headers: {
                                        ...job.cronHeaders
                                    }
                                }
                                axios.post(job.cronUrl, job.cronBody, axiosRequestConfig);
                                break;
                            default:
                                break;
                        }
                    } finally {
                        await this.redisService.del(lockKey);
                    }
                });
                this.schedulerRegistry.addCronJob(job.cronName, newJob);
                newJob.start();

            });
        } catch (error) {
            return;
        }
    }

    deactivateJob(jobName: string) {
        try {
            this.mongoService.deactivateJob(jobName);
            return "success";
        } catch (error) {
            return "fail";
        }
    }

    activateJob(jobName: string ) {
        try {
            this.activateJob(jobName);
            return "success";
        } catch (error) {
            return "fail";
        }
    }

    async findAll() {
        try {
           return await this.findAll();
        } catch (error) {
            return [];
        }
    }
}