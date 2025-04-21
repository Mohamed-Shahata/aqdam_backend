import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, RequestTimeoutException } from "@nestjs/common";



@Injectable()
export class MailService {

  constructor(private readonly mailerService: MailerService) { };

  /**
   * Sends an email containing a verification code to the user.
   *
   * @param email - The recipient's email address.
   * @param code - The verification code to be sent in the email.
   * @throws {RequestTimeoutException} If the email fails to send.
   *
   * @example
   * await mailService.sendMail("user@example.com", "123456");
   */
  public async sendMail(email: string, code: string) {
    try {
      this.mailerService.sendMail({
        from: process.env.USERNAME_EMAIL,
        to: email,
        subject: "Verify Code",
        template: "verify-code.ejs",
        context: { email, code }
      })
    } catch (error) {
      console.log("Error", error)
      throw new RequestTimeoutException();
    }
  }
};