"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const user_controller_1 = require("./user.controller");
const user_service_1 = require("./user.service");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./user.entity");
const cloudinary_module_1 = require("../uploads/cloudinary.module");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const redis_module_1 = require("../redis/redis.module");
const platform_express_1 = require("@nestjs/platform-express");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cloudinary_module_1.CloudinaryModule,
            redis_module_1.RedisModule,
            platform_express_1.MulterModule,
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    global: true,
                    secret: config.get("JWT_SECRET"),
                    signOptions: { expiresIn: config.get("JWT_EXPIRESIN") }
                })
            })
        ],
        controllers: [user_controller_1.UserController],
        providers: [user_service_1.UserService],
        exports: [user_service_1.UserService]
    })
], UserModule);
;
//# sourceMappingURL=user.module.js.map