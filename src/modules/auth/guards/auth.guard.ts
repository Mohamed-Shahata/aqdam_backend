import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { UserRole } from "src/utils/enum.roles";
import { Request } from "express";
import { JWTPayload } from "src/utils/type";
import { UserService } from "src/modules/users/user.service";
import { CURRENT_USER_KEY } from "src/utils/constant";


@Injectable()
export class AuthGuard implements CanActivate {


  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly reflector: Reflector
  ) { }


  async canActivate(context: ExecutionContext) {

    console.log("test")

    const roles: UserRole = this.reflector.getAllAndOverride(
      "roles",
      [context.getHandler(), context.getClass()]
    )

    const request: Request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    if (token && type === this.config.get<string>("TOKEN_PREFIX")) {
      try {
        const payload: JWTPayload = await this.jwtService.verify(token, {
          secret: this.config.get<string>("JWT_SECRET")
        });

        const user = await this.userService.getOne(payload.id);
        if (!user) return false;

        if (roles && roles.length > 0) {
          if (!roles.includes(user.role)) {
            throw new UnauthorizedException("Access denied, insufficient role")
          }
        }
        request[CURRENT_USER_KEY] = payload;
        return true;

      } catch (error) {
        throw new UnauthorizedException("Access denied, invalid token");
      }
    } else {
      throw new UnauthorizedException("Access denied, no token provided");
    }
  };
}