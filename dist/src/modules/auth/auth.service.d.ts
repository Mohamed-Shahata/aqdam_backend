import { User } from "../users/user.entity";
import { Repository } from "typeorm";
import { RegisterDto } from "./dto/register.dto";
import { JwtService } from "@nestjs/jwt";
import { AccessToken } from "src/utils/type";
import { LoginDto } from "./dto/login.dto";
import { VerifyCodeDto } from "./dto/verify-code.dto";
import { MailService } from "../mail/mail.service";
export declare class AuthService {
    private readonly userRrpository;
    private readonly jwtService;
    private readonly mailService;
    constructor(userRrpository: Repository<User>, jwtService: JwtService, mailService: MailService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    verifyCode(dto: VerifyCodeDto): Promise<AccessToken>;
    login(dto: LoginDto): Promise<AccessToken>;
    private hashPassword;
    private genrateToken;
}
