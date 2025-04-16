import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../users/user.entity";
import { CURRENT_TIMESTAMP } from "src/utils/constant";


@Entity()
export class Job {

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  title: string;

  @Column()
  short_intro?: string;

  @Column()
  responsibilities: string;

  @Column()
  requirements: string;

  @Column()
  extra_info: string;

  @Column()
  email_applay: string;

  @CreateDateColumn({ type: "timestamp", default: () => CURRENT_TIMESTAMP })
  createdAt: Date

  @CreateDateColumn({ type: "timestamp", default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
  updatedAt: Date

  @ManyToOne(() => User, (user) => user.job, { eager: true })
  user: User
}