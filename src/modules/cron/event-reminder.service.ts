import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class EventReminderService {
  private readonly logger = new Logger(EventReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) { }

  // Sistemin yorulmaması için production'da EVERY_HOUR kullanıyoruz
  @Cron(CronExpression.EVERY_HOUR)
  async handleEventReminders() {
    this.logger.debug('🔎 [CRON] 24 saat içindeki etkinlikler kontrol ediliyor... (Her 1 saatte bir çalışır)');

    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    try {
      // Sadece henüz hatırlatma gönderilmemiş (reminderSent: false) ve başlama saati yaklaşmış (24 saatten az kalmış) katılımcıları getir
      const upcomingEvents = await this.prisma.event.findMany({
        where: {
          date: {
            gt: now, // Geçmiş etkinliklere mail atmasın
            lte: next24Hours, // 24 saat veya daha az kalmış etkinlikler
          },
        },
        include: {
          participants: {
            where: { reminderSent: false },
            include: {
              user: true,
            },
          },
        },
      });

      for (const event of upcomingEvents) {
        if (event.participants.length === 0) continue;

        this.logger.log(`📅 Etkinlik: "${event.title}" — ${event.participants.length} kişiye hatırlatma gönderiliyor.`);

        for (const participant of event.participants) {
          if (!participant.user.email) continue;

          try {
            await this.mailService.sendEventReminderEmail(participant.user.email, event);

            // Başarılı gönderim sonrası flag'i güncelle — bir daha gönderilmeyecek
            await this.prisma.eventParticipant.update({
              where: { id: participant.id },
              data: { reminderSent: true },
            });

            this.logger.log(`✅ Hatırlatma gönderildi: ${participant.user.email}`);
          } catch (err) {
            this.logger.error(`❌ Hatırlatma gönderilemedi: ${participant.user.email}`, err);
          }
        }
      }

      if (upcomingEvents.length === 0 || upcomingEvents.every(e => e.participants.length === 0)) {
        this.logger.debug('ℹ️ Bu pencerede hatırlatma gönderilecek katılımcı yok.');
      }
    } catch (error) {
      this.logger.error('Etkinlik sorgusu sırasında hata oluştu', error);
    }
  }
}
