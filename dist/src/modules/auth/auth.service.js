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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/user.entity");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const jwt_1 = require("@nestjs/jwt");
const mail_service_1 = require("../mail/mail.service");
let AuthService = class AuthService {
    userRrpository;
    jwtService;
    mailService;
    constructor(userRrpository, jwtService, mailService) {
        this.userRrpository = userRrpository;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }
    ;
    async register(dto) {
        const { firstName, lastName, age, email, password } = dto;
        const userExsits = await this.userRrpository.findOne({ where: { email } });
        if (userExsits)
            throw new common_1.BadRequestException("Registration failed. Please try again later.");
        const hashedPassword = await this.hashPassword(password);
        const code = Math.floor(100000 + Math.random() * 900000);
        await this.mailService.sendMail(email, String(code));
        const newUser = this.userRrpository.create({
            firstName,
            lastName,
            age,
            email,
            password: hashedPassword,
            verificationCode: String(code)
        });
        await this.userRrpository.save(newUser);
        return { message: "Check your email" };
    }
    async verifyCode(dto) {
        const { email, code } = dto;
        const user = await this.userRrpository.findOne({ where: { email } });
        if (!user)
            throw new common_1.BadRequestException("User not found");
        if (code !== user.verificationCode)
            throw new common_1.BadRequestException("Code is wrong");
        user.isAccountVerify = true;
        user.verificationCode = null;
        await this.userRrpository.save(user);
        const accessToken = await this.genrateToken({ id: user.id, role: user.role });
        return { accessToken };
    }
    async login(dto) {
        const { email, password } = dto;
        const user = await this.userRrpository.findOne({ where: { email } });
        if (!user)
            throw new common_1.BadRequestException("Email or password is wrong");
        const isPasswordMatch = bcrypt.compareSync(password, user.password);
        if (!isPasswordMatch)
            throw new common_1.BadRequestException("Email or password is wrong");
        const accessToken = await this.genrateToken({ id: user.id, role: user.role });
        return { accessToken };
    }
    async hashPassword(password) {
        const salt = bcrypt.genSaltSync(Number(process.env.SOLD_NUMBER));
        return bcrypt.hashSync(password, salt);
    }
    async genrateToken(payload) {
        return this.jwtService.signAsync(payload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
;
//# sourceMappingURL=auth.service.js.map