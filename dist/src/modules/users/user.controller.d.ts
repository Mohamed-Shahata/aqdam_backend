import { UserService } from "./user.service";
import { UpdateUserDto } from "./dto/user-update.dto";
import { JWTPayload } from "src/utils/type";
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getAllUsers(search: string): Promise<import("./user.entity").User[]>;
    getAllPeople(search: string, page: string, limit: string): Promise<{
        data: import("./user.entity").User[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getOneUser(id: number): Promise<import("./user.entity").User>;
    getOneUserCache(id: number): Promise<any>;
    getmeUser(Payload: JWTPayload): Promise<import("./user.entity").User>;
    updateUser(payload: JWTPayload, dto: UpdateUserDto): Promise<import("./user.entity").User>;
    deleteUser(payload: JWTPayload): Promise<{
        message: string;
    }>;
    uploadImageUser(file: Express.Multer.File, payload: JWTPayload): Promise<{
        imageUrl: string | null;
    }>;
    deleteImage(payload: JWTPayload): Promise<import("./user.entity").User>;
    toggleFollowUser(targetId: number, payload: JWTPayload): Promise<{
        message: string;
    }>;
    getFollowingUser(id: number): Promise<import("./user.entity").User[] | undefined>;
    getFollowingUserMe(payload: JWTPayload): Promise<import("./user.entity").User[] | undefined>;
    getFollowersUser(id: number): Promise<import("./user.entity").User[] | undefined>;
}
