import { GenderType, UserRole } from "src/utils/enum.roles";
import { Column, Entity, JoinTable, Like, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Job } from "../jobs/job.entity";
import { Post } from "../posts/post.entity";
import { Reaction } from "../posts/likes.entity";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({ type: "integer" })
  age: number

  @Column({ type: "varchar", length: "250", unique: true })
  email: string

  @Column()
  password: string

  @Column({ type: "enum", enum: GenderType, default: "male" })
  gender: GenderType

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role: UserRole

  @Column({ nullable: true })
  bio: string

  @Column({ type: "varchar", nullable: true })
  profileImage: string | null

  @Column({ type: "varchar", nullable: true })
  imagePublicId: string | null

  @Column({ default: false })
  isAccountVerify: boolean

  @Column({ type: "varchar", nullable: true })
  verificationCode: string | null

  @Column({ type: "integer", default: 0 })
  point: number

  @ManyToMany(() => User, user => user.followers)
  @JoinTable({
    name: "user_followers",
    joinColumn: {
      name: "follower_id",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "following_id",
      referencedColumnName: "id"
    }
  })
  following: User[]

  @ManyToMany(() => User, user => user.following)
  followers: User[]

  @OneToMany(() => Job, (job) => job.user)
  job: Job[]

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[]

  @ManyToMany(() => Job, (job) => job.favoriteBy)
  @JoinTable()
  favorites: Job[]

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reaction: Reaction[]
};