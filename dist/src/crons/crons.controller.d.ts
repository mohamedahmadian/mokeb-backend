import { CronsService } from './crons.service';
export declare class CronsController {
    private readonly cronsService;
    constructor(cronsService: CronsService);
    listJobs(): import("./crons.service").CronJobDefinition[];
    runJob(jobId: string): Promise<import("./crons.service").CronJobRunResult>;
}
