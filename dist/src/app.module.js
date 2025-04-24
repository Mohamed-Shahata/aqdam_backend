"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./modules/auth/auth.module");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const user_module_1 = require("./modules/users/user.module");
const post_module_1 = require("./modules/posts/post.module");
const job_module_1 = require("./modules/jobs/job.module");
const notification_module_1 = require("./modules/notifications/notification.module");
const data_source_1 = require("../db/data-source");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            schedule_1.ScheduleModule.forRoot(),
            user_module_1.UserModule,
            post_module_1.PostModule,
            job_module_1.JobModule,
            notification_module_1.NotificationModule,
            typeorm_1.TypeOrmModule.forRoot(data_source_1.dataSourceOptions),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ".env"
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 10000,
                    limit: 6
                }
            ])
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard
            }
        ]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map