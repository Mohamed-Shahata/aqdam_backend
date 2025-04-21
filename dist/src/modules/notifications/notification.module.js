"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const notification_gateway_1 = require("./notification.gateway");
const typeorm_1 = require("@nestjs/typeorm");
const notification_entity_1 = require("./notification.entity");
const notification_service_1 = require("./notification.service");
const notification_controller_1 = require("./notification.controller");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const user_module_1 = require("../users/user.module");
const redis_module_1 = require("../redis/redis.module");
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            user_module_1.UserModule,
            redis_module_1.RedisModule,
            typeorm_1.TypeOrmModule.forFeature([notification_entity_1.Notification]),
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    global: true,
                    secret: config.get("JWT_SECRET"),
                    signOptions: { expiresIn: config.get("JWT_EXPIRESIN") }
                })
            })
        ],
        providers: [notification_gateway_1.NotificationsGateway, notification_service_1.NotificationService],
        controllers: [notification_controller_1.NotificationController],
        exports: [notification_gateway_1.NotificationsGateway, notification_service_1.NotificationService]
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map