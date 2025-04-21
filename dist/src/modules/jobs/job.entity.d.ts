import { User } from "../users/user.entity";
export declare class Job {
    id: number;
    title: string;
    short_intro?: string;
    responsibilities: string;
    requirements: string;
    extra_info?: string;
    email_applay: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    favoriteBy: User[];
}
