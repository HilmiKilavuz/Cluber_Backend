import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

import * as nodemailer from 'nodemailer';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let user = configService.get<string>('SMTP_USER');
        let pass = configService.get<string>('SMTP_PASS');
        let host = configService.get<string>('SMTP_HOST', 'smtp.ethereal.email');
        let port = configService.get<number>('SMTP_PORT', 587);

        // If no valid SMTP user is provided in .env, auto-generate a test account
        if (!user || user === 'ethereal.user@ethereal.email') {
          const testAccount = await nodemailer.createTestAccount();
          host = testAccount.smtp.host;
          port = testAccount.smtp.port;
          user = testAccount.user;
          pass = testAccount.pass;
          console.log(`\n📧 [MailModule] No SMTP .env found. Using auto-generated Ethereal Test Account!`);
          console.log(`📧 Test Email Login: ${user}`);
        }

        return {
          transport: {
            host,
            port,
            secure: configService.get<boolean>('SMTP_SECURE', false),
            requireTLS: true,
            auth: {
              user,
              pass,
            },
          },
          defaults: {
            from: '"Cluber Notifications" <noreply@cluber.com>',
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
