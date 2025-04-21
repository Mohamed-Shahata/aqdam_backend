import { User } from "../users/user.entity";
import { Post } from "./post.entity";
import { ReactionType } from "src/utils/enum.roles";
export declare class Reaction {
    id: number;
    user: User;
    post: Post;
    type: ReactionType | null;
    createdAt: Date;
}
