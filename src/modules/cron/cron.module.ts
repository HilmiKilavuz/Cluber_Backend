import { Module } from '@nestjs/common';
import { EventReminderService } from './event-reminder.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [EventReminderService],
})
export class CronModule {}
