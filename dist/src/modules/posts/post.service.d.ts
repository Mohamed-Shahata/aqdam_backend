import { Post } from "./post.entity";
import { Repository } from "typeorm";
import { CreatePostDto } from "./dto/create-post.dto";
import { UserService } from "../users/user.service";
import { User } from "../users/user.entity";
import { NotificationsGateway } from "../notifications/notification.gateway";
import { NotificationService } from "../notifications/notification.service";
import { Notification } from "../notifications/notification.entity";
import { UpdatePostDto } from "./dto/update-post.dto";
import { ReactionType } from "src/utils/enum.roles";
import { JWTPayload } from "src/utils/type";
import { Reaction } from "./likes.entity";
import { RedisService } from "../redis/redis.service";
import { Job } from "../jobs/job.entity";
export declare class PostService {
    private readonly postRepository;
    private readonly userRepository;
    private readonly jobRepository;
    private readonly notificationRepository;
    private readonly reactionRepository;
    private readonly userService;
    private readonly notificationGateway;
    private readonly notificationService;
    private readonly redisService;
    constructor(postRepository: Repository<Post>, userRepository: Repository<User>, jobRepository: Repository<Job>, notificationRepository: Repository<Notification>, reactionRepository: Repository<Reaction>, userService: UserService, notificationGateway: NotificationsGateway, notificationService: NotificationService, redisService: RedisService);
    create(userId: number, dto: CreatePostDto): Promise<{
        message: string;
    }>;
    getAllPostsAndJobsFollowing(userId: number, page?: number, limit?: number): Promise<any>;
    getAllForUserId(currentUserId: number): Promise<Post[]>;
    getOne(postId: number): Promise<Post>;
    update(payload: JWTPayload, postId: number, dto: UpdatePostDto): Promise<Post>;
    delete(payload: JWTPayload, postId: number): Promise<{
        message: string;
    }>;
    reactionToPost(currentUserId: number, postId: number, type: ReactionType): Promise<Reaction>;
    removeReactionFromPost(currentUserId: number, postId: number): Promise<Reaction>;
    getReactionFromPost(postId: number): Promise<{
        benefited: number;
        not_benefited: number;
    }>;
    getReactionCurrentUser(userId: number): Promise<any[]>;
}
