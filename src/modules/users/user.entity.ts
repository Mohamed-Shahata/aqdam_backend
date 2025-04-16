import { UserRole } from "src/utils/enum.roles";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

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
};