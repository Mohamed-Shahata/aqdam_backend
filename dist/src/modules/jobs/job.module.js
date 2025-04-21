"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobModule = void 0;
const common_1 = require("@nestjs/common");
const job_controller_1 = require("./job.controller");
const job_service_1 = require("./job.service");
const user_module_1 = require("../users/user.module");
const typeorm_1 = require("@nestjs/typeorm");
const job_entity_1 = require("./job.entity");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../users/user.entity");
const notification_entity_1 = require("../notifications/notification.entity");
const notification_gateway_1 = require("../notifications/notification.gateway");
const redis_module_1 = require("../redis/redis.module");
const notification_service_1 = require("../notifications/notification.service");
let JobModule = class JobModule {
};
exports.JobModule = JobModule;
exports.JobModule = JobModule = __decorate([
    (0, common_1.Module)({
        imports: [
            user_module_1.UserModule,
            redis_module_1.RedisModule,
            typeorm_1.TypeOrmModule.forFeature([job_entity_1.Job, user_entity_1.User, notification_entity_1.Notification]),
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    global: true,
                    secret: config.get("JWT_SECRET"),
                    signOptions: { expiresIn: config.get("JWT_EXPIRESIN") }
                })
            }),
        ],
        controllers: [job_controller_1.JobController],
        providers: [job_service_1.JobService, notification_gateway_1.NotificationsGateway, notification_service_1.NotificationService]
    })
], JobModule);
;
//# sourceMappingURL=job.module.js.map