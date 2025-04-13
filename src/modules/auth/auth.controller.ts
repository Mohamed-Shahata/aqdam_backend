import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { VerifyCodeDto } from "./dto/verify-code.dto";


@Controller("auth")
export class AuthController {

  constructor(private readonly authService: AuthService) { };

  //POST: ~/api/auth/register
  @Post("/register")
  @HttpCode(HttpStatus.OK)
  public register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("/verify-code")
  public verifyCode(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyCode(dto);
  }

  //POST: ~/api/auth/login
  @Post("/login")
  @HttpCode(HttpStatus.OK)
  public login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

};