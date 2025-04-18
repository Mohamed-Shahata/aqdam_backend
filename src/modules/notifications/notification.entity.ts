import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../users/user.entity";


@Entity()
export class Notification {

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  message: string

  @Column({ type: "integer", nullable: true })
  jobId: number | null;

  @Column({ type: "integer", nullable: true })
  postId: number | null;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  recipient: User

  @Column({ default: false })
  isRead: boolean

  @CreateDateColumn()
  createdAt: Date
}