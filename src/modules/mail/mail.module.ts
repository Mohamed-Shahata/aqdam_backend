import { MailerModule } from "@nestjs-modules/mailer";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { join } from "path";
import { EjsAdapter } from "@nestjs-modules/mailer/dist/adapters/ejs.adapter"
import { MailService } from "./mail.service";

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>("SMTP_HOST"),
          port: config.get<number>("SMTP_PORT"),
          secure: true,
          auth: {
            user: config.get<string>("SMTP_USERNAME"),
            pass: config.get<string>("SMTP_PASSWORD")
          }
        },
        template: {
          dir: join(__dirname, "template"),
          adapter: new EjsAdapter({
            inlineCssEnabled: true
          })
        }
      })
    })
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule { };