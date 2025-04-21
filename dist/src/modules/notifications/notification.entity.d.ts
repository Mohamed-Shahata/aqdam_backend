import { User } from "../users/user.entity";
import { Job } from "../jobs/job.entity";
import { Post } from "../posts/post.entity";
export declare class Notification {
    id: number;
    message: string;
    job: Job;
    post: Post;
    recipient: User;
    isRead: boolean;
    createdAt: Date;
}
