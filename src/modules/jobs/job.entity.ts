import { Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Job {

  @PrimaryGeneratedColumn()
  id: number
}