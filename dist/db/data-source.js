"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
const job_entity_1 = require("../src/modules/jobs/job.entity");
const notification_entity_1 = require("../src/modules/notifications/notification.entity");
const likes_entity_1 = require("../src/modules/posts/likes.entity");
const post_entity_1 = require("../src/modules/posts/post.entity");
const user_entity_1 = require("../src/modules/users/user.entity");
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: '.env' });
exports.dataSourceOptions = {
    type: "postgres",
    url: process.env.DATABASE_URI,
    entities: [user_entity_1.User, post_entity_1.Post, job_entity_1.Job, likes_entity_1.Reaction, notification_entity_1.Notification],
    migrations: ['dist/db/migrations/*.js']
};
const dataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
exports.default = dataSource;
//# sourceMappingURL=data-source.js.map