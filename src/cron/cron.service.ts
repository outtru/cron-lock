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

    private readonly redis: Redis;

    @Inject(SchedulerRegistry) private schedulerRegistry:SchedulerRegistry;
    @Inject(MongoService) private mongoService:MongoService;
    @Inject(RedisService) private redisService: RedisService;
    constructor(
        @Inject('CONFIG_OPTIONS') private options: Record<string, any>
    ) { }
    onModuleInit() {
        this.scheduleCronJobsInit()
    }
    
    async scheduleCronJobsInit(){
        try {
            const cronDocs= await (await this.mongoService.findAll()).toArray();
            cronDocs.forEach((job) => {
                const newJob = new CronJob(job.cronTime, async () => {
                    if (job.status.toUpperCase() != isActiveEnum.ACTIVE) { return; }
                    const lockKey: string = `cron-lock:${job.cronName}`;
                    const lockAcquired: number = await this.redis.setnx(lockKey, '1');
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
                        await this.redis.del(lockKey);
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
                    const lockAcquired: number = await this.redis.setnx(lockKey, '1');
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
                        await this.redis.del(lockKey);
                    }
                });
                this.schedulerRegistry.addCronJob(job.cronName, newJob);
                newJob.start();

            });
        } catch (error) {
            return;
        }
    }

    deleteJob(jobName: string, mongoFlag: boolean) {
        try {
            if (!(jobName in this.findAll())) {
                return "CronJob Name not found.";
            }
            this.schedulerRegistry.deleteCronJob(jobName);
            return "success";
        } catch (error) {
            return "fail";
        }
    }

    findAll() {
        try {
            const jobs = this.schedulerRegistry.getCronJobs();
            return Array.from(jobs.keys()) || [];
        } catch (error) {
            return [];
        }
    }
}