import { PostService } from "./post.service";
import { JWTPayload } from "src/utils/type";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { ReactionType } from "src/utils/enum.roles";
export declare class PostController {
    private readonly postService;
    constructor(postService: PostService);
    getAllFeeds(payload: JWTPayload, page: string, limit: string): Promise<any>;
    getAllPostsWithMe(userId: number, page: string, limit: string): Promise<{
        data: import("./post.entity").Post[];
        currentPage: number;
        totalPages: number;
        totalItems: number;
    }>;
    getOnePost(id: number): Promise<import("./post.entity").Post>;
    createPost(payload: JWTPayload, dto: CreatePostDto): Promise<{
        message: string;
    }>;
    updatePost(payload: JWTPayload, id: number, dto: UpdatePostDto): Promise<import("./post.entity").Post>;
    deletePost(payload: JWTPayload, id: number): Promise<{
        message: string;
    }>;
    reaction(payload: JWTPayload, id: number, type: ReactionType): Promise<import("./likes.entity").Reaction>;
    removeReaction(payload: JWTPayload, id: number): Promise<import("./likes.entity").Reaction>;
    getReaction(id: number): Promise<{
        benefited: number;
        not_benefited: number;
    }>;
    getReactionMe(payload: JWTPayload): Promise<any[]>;
}
