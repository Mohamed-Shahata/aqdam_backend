import { UserRole } from "src/utils/enum.roles";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

  @Column({ nullable: true })
  profileImage: string

  @Column({ default: false })
  isAccountVerify: boolean

  @Column({ type: "varchar", nullable: true })
  verificationCode: string | null
}