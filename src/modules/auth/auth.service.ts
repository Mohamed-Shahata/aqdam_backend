import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../users/user.entity";
import { Repository } from "typeorm";
import { RegisterDto } from "./dto/register.dto";
import * as bcrypt from "bcryptjs"
import { JwtService } from "@nestjs/jwt";
import { AccessToken, JWTPayload } from "src/utils/type";
import { LoginDto } from "./dto/login.dto";
import { VerifyCodeDto } from "./dto/verify-code.dto";
import { MailService } from "../mail/mail.service";


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User) private readonly userRrpository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { };

  /**
   * Registers a new user, sends verification code via email.
   *
   * @param dto - User registration data
   * @returns A success message to check email
   * @throws BadRequestException if user already exists
   */
  public async register(dto: RegisterDto) {
    const { firstName, lastName, age, email, password } = dto;
    const userExsits = await this.userRrpository.findOne({ where: { email } });
    if (userExsits)
      throw new BadRequestException("Registration failed. Please try again later.");

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
    return { message: "Check your email" }
  }

  /**
   * Verifies the code sent to user's email.
   *
   * @param dto - Verification data containing email and code
   * @returns JWT access token if verification successful
   * @throws BadRequestException if user not found or code is wrong
   */
  public async verifyCode(dto: VerifyCodeDto): Promise<AccessToken> {
    const { email, code } = dto;

    const user = await this.userRrpository.findOne({ where: { email } });
    if (!user)
      throw new BadRequestException("User not found");

    if (code !== user.verificationCode)
      throw new BadRequestException("Code is wrong");

    user.isAccountVerify = true;
    user.verificationCode = null;

    await this.userRrpository.save(user);

    const accessToken = await this.genrateToken({ id: user.id, role: user.role });
    return { accessToken }
  }

  /**
   * Authenticates user credentials and returns JWT.
   *
   * @param dto - Login credentials (email, password)
   * @returns JWT access token if credentials are valid
   * @throws BadRequestException if email or password is wrong
   */
  public async login(dto: LoginDto): Promise<AccessToken> {
    const { email, password } = dto;

    const user = await this.userRrpository.findOne({ where: { email } });
    if (!user)
      throw new BadRequestException("Email or password is wrong");

    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch)
      throw new BadRequestException("Email or password is wrong");

    const accessToken = await this.genrateToken({ id: user.id, role: user.role });
    return { accessToken }
  }

  /**
   * Hashes a plain password using bcrypt.
   *
   * @param password - Plain user password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = bcrypt.genSaltSync(Number(process.env.SOLD_NUMBER));
    return bcrypt.hashSync(password, salt);
  }

  /**
   * Generates a JWT access token for authenticated users.
   *
   * @param payload - JWT payload (user id and role)
   * @returns Signed JWT token
   */
  private async genrateToken(payload: JWTPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
};