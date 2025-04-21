import { MailerService } from "@nestjs-modules/mailer";
export declare class MailService {
    private readonly mailerService;
    constructor(mailerService: MailerService);
    sendMail(email: string, code: string): Promise<void>;
}
