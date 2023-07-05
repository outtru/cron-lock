import { RequestMethodEnum, isActiveEnum } from "../enums/cron.enums";

export interface CreateCron {
    cronName: string;
    cronTime: string;
    cronUrl: string;
    cronBody: string;
    cronHeaders: any;
    cronMethod: RequestMethodEnum;
    status: isActiveEnum;
}