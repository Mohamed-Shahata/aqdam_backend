import { User } from "../users/user.entity";
import { Reaction } from "./likes.entity";
export declare class Post {
    id: number;
    title: string;
    content: string;
    resources?: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    reaction: Reaction[];
}
