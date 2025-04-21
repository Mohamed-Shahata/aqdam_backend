"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const core_1 = require("@nestjs/core");
const user_service_1 = require("../../users/user.service");
const constant_1 = require("../../../utils/constant");
let AuthGuard = class AuthGuard {
    config;
    jwtService;
    userService;
    reflector;
    constructor(config, jwtService, userService, reflector) {
        this.config = config;
        this.jwtService = jwtService;
        this.userService = userService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const roles = this.reflector.getAllAndOverride("roles", [context.getHandler(), context.getClass()]);
        const request = context.switchToHttp().getRequest();
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        if (token && type === this.config.get("TOKEN_PREFIX")) {
            try {
                const payload = await this.jwtService.verifyAsync(token, {
                    secret: this.config.get("JWT_SECRET")
                });
                const user = await this.userService.getOne(payload.id);
                if (!user)
                    return false;
                if (roles && roles.length > 0) {
                    if (!roles.includes(user.role)) {
                        throw new common_1.UnauthorizedException("Access denied, insufficient role");
                    }
                }
                request[constant_1.CURRENT_USER_KEY] = payload;
                return true;
            }
            catch (error) {
                throw new common_1.UnauthorizedException("Access denied, invalid token");
            }
        }
        else {
            throw new common_1.UnauthorizedException("Access denied, no token provided");
        }
    }
    ;
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        user_service_1.UserService,
        core_1.Reflector])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map