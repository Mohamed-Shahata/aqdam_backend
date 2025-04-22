import { Job } from "./job.entity";
import { Repository } from "typeorm";
import { CreateJobDto } from "./dto/create-job.dto";
import { UserService } from "../users/user.service";
import { JWTPayload } from "src/utils/type";
import { UpdateJobDto } from "./dto/update-job.dto";
import { User } from "../users/user.entity";
import { Notification } from "../notifications/notification.entity";
import { NotificationsGateway } from "../notifications/notification.gateway";
import { NotificationService } from "../notifications/notification.service";
import { RedisService } from "../redis/redis.service";
export declare class JobService {
    private readonly jobRepository;
    private readonly userRepository;
    private readonly notificationRepository;
    private readonly userService;
    private readonly notificationGateway;
    private readonly notificationService;
    private readonly redisService;
    constructor(jobRepository: Repository<Job>, userRepository: Repository<User>, notificationRepository: Repository<Notification>, userService: UserService, notificationGateway: NotificationsGateway, notificationService: NotificationService, redisService: RedisService);
    getAll(): Promise<Job[]>;
    getAllForUserId(id: number, page?: number, limit?: number): Promise<{
        data: Job[];
        currentPage: number;
        totalPages: number;
        totalItems: number;
    }>;
    getOne(id: number): Promise<Job>;
    create(userId: number, dto: CreateJobDto): Promise<Job>;
    update(payload: JWTPayload, jobId: number, dto: UpdateJobDto): Promise<Job>;
    delete(payload: JWTPayload, jobId: number): Promise<{
        message: string;
    }>;
    addToFavorites(currentUserId: number, jobId: number): Promise<User>;
    removeFromFavorite(currentUserId: number, jobId: number): Promise<User>;
    getFavorites(currentUserId: number): Promise<Job[]>;
    getFavoritesJobProfile(currentUserId: number): Promise<any[]>;
}
