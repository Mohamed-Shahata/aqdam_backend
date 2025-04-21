import { JobService } from "./job.service";
import { JWTPayload } from "src/utils/type";
import { CreateJobDto } from "./dto/create-job.dto";
import { UpdateJobDto } from "./dto/update-job.dto";
export declare class JobController {
    private readonly jobService;
    constructor(jobService: JobService);
    getAllJobs(): Promise<import("./job.entity").Job[]>;
    getAllJobsWithMe(userId: number): Promise<import("./job.entity").Job[]>;
    getOneJob(id: number): Promise<import("./job.entity").Job>;
    createJob(payload: JWTPayload, dto: CreateJobDto): Promise<import("./job.entity").Job>;
    updateJob(payload: JWTPayload, id: number, dto: UpdateJobDto): Promise<import("./job.entity").Job>;
    deleteJob(payload: JWTPayload, id: number): Promise<{
        message: string;
    }>;
    addJobToFavorites(payload: JWTPayload, jobId: number): Promise<import("../users/user.entity").User>;
    deleteJobFromFavorites(payload: JWTPayload, jobId: number): Promise<import("../users/user.entity").User>;
    getUserFavorite(payload: JWTPayload): Promise<import("./job.entity").Job[]>;
}
