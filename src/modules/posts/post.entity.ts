import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../users/user.entity";


@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string

  @Column({ type: "text" })
  introduction: string

  @Column({ type: "text" })
  objectives_learn: string

  @Column({ type: "text" })
  content: string;

  @Column({ type: "text", nullable: true })
  use_cases?: string

  @Column({ type: "text", nullable: true })
  additional_tips?: string

  @Column({ type: "text", nullable: true })
  resources?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  user: User
};