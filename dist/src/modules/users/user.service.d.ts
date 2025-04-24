import { User } from "./user.entity";
import { Repository } from "typeorm";
import { UpdateUserDto } from "./dto/user-update.dto";
import { CloudinaryService } from "../uploads/cloudinary.service";
import { JWTPayload } from "src/utils/type";
import { RedisService } from "../redis/redis.service";
export declare class UserService {
    private readonly userRepository;
    private readonly cloudinaryService;
    private readonly redisService;
    constructor(userRepository: Repository<User>, cloudinaryService: CloudinaryService, redisService: RedisService);
    deleteUnverifiedUser(): Promise<void>;
    getAll(search?: string): Promise<User[]>;
    getAllPeople(search?: string, page?: number, pageSize?: number): Promise<{
        data: User[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getOne(id: number): Promise<User>;
    getOneUserCache(id: number): Promise<any>;
    getMe(id: number): Promise<User>;
    update(payload: JWTPayload, dto: UpdateUserDto): Promise<User>;
    delete(payload: JWTPayload): Promise<{
        message: string;
    }>;
    uploadImage(payload: JWTPayload, file: Express.Multer.File): Promise<{
        imageUrl: string | null;
    }>;
    deleteImage(payload: JWTPayload): Promise<User>;
    toggleFollow(id: number, targetUserId: number): Promise<{
        message: string;
    }>;
    getFollowing(id: number): Promise<User[] | undefined>;
    getFollowingMe(id: number): Promise<User[] | undefined>;
    getFollowers(id: number): Promise<User[] | undefined>;
}
