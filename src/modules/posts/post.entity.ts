import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Reaction } from "./likes.entity";


@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column({ type: "text" })
  content: string;

  @Column({ type: "text", nullable: true })
  resources?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  user: User

  @OneToMany(() => Reaction, (reaction) => reaction.post)
  reaction: Reaction[]
};