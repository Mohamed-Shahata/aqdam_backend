import { CanActivate, ExecutionContext } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { UserService } from "src/modules/users/user.service";
export declare class AuthGuard implements CanActivate {
    private readonly config;
    private readonly jwtService;
    private readonly userService;
    private readonly reflector;
    constructor(config: ConfigService, jwtService: JwtService, userService: UserService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
