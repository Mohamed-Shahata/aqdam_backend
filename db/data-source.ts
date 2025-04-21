import { Job } from "src/modules/jobs/job.entity";
import { Notification } from "src/modules/notifications/notification.entity";
import { Reaction } from "src/modules/posts/likes.entity";
import { Post } from "src/modules/posts/post.entity";
import { User } from "src/modules/users/user.entity";
import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
config({ path: '.env' });

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  url: process.env.DATABASE_URI,
  entities: [User, Post, Job, Reaction, Notification],
  migrations: ['dist/db/migrations/*.js']
}

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;