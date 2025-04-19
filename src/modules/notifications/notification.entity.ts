import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Job } from "../jobs/job.entity";
import { Post } from "../posts/post.entity";


@Entity()
export class Notification {

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  message: string

  @ManyToOne(() => Job, { onDelete: "CASCADE", nullable: true })
  job: Job;

  @ManyToOne(() => Post, { onDelete: "CASCADE", nullable: true })
  post: Post;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  recipient: User

  @Column({ default: false })
  isRead: boolean

  @CreateDateColumn()
  createdAt: Date
}