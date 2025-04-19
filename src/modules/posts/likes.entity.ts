import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Post } from "./post.entity";
import { ReactionType } from "src/utils/enum.roles";


@Entity()
export class Reaction {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, (user) => user.reaction)
  user: User

  @ManyToOne(() => Post, (post) => post.reaction, { eager: true })
  post: Post

  @Column({ type: "enum", enum: ReactionType, default: ReactionType.BENEFITED, nullable: true })
  type: ReactionType | null

  @CreateDateColumn()
  createdAt: Date
}