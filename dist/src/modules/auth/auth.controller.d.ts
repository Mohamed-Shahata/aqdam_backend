import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { VerifyCodeDto } from "./dto/verify-code.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    verifyCode(dto: VerifyCodeDto): Promise<import("../../utils/type").AccessToken>;
    login(dto: LoginDto): Promise<import("../../utils/type").AccessToken>;
}
