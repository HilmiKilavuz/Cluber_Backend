import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, code: string) {
    try {
      const info = await this.mailerService.sendMail({
        to: email,
        subject: 'Cluber - Verify your email',
        text: `Your verification code is: ${code}`,
        html: `<b>Your verification code is: <span style="font-size: 24px; color: #4F46E5;">${code}</span></b><br/><p>Please enter this code to verify your account. It will expire in 15 minutes.</p>`,
      });
      this.logger.log(`Verification email sent to ${email}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Error sending verification email to ${email}`, error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendEventReminderEmail(email: string, eventDetails: any) {
    try {
      const info = await this.mailerService.sendMail({
        to: email,
        subject: `🎉 Heyecan Dorukta: "${eventDetails.title}" Başlıyor!`,
        text: `Hatırlatma: ${eventDetails.title} etkinliği ${new Date(eventDetails.date).toLocaleString('tr-TR')} tarihinde ${eventDetails.location} adresinde gerçekleşecek. Seni aramızda görmek için sabırsızlanıyoruz!`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f4f6f9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <!-- Header -->
            <div style="background-color: #4F46E5; padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Etkinlik Zamanı Geldi! 🚀</h1>
              <p style="color: #e0e7ff; font-size: 16px; margin-top: 10px; opacity: 0.9;">Hazırlan, harika bir deneyim seni bekliyor.</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 40px 30px; background-color: #ffffff;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">Merhaba! 👋</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">Katılacağını belirttiğin <strong>"${eventDetails.title}"</strong> etkinliğine 24 saatten az bir süre kaldı. Seni aramızda göreceğimiz için çok heyecanlıyız!</p>
              
              <!-- Event Details Card -->
              <div style="background-color: #f8fafc; border-left: 4px solid #4F46E5; padding: 25px; margin: 30px 0; border-radius: 6px;">
                <p style="margin: 0 0 15px 0; font-size: 16px;">
                  <span style="display: inline-block; width: 24px; color: #4F46E5;">📅</span>
                  <strong style="color: #334155;">Tarih & Saat:</strong><br>
                  <span style="color: #64748b; margin-left: 28px;">${new Date(eventDetails.date).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}</span>
                </p>
                <p style="margin: 0; font-size: 16px;">
                  <span style="display: inline-block; width: 24px; color: #4F46E5;">📍</span>
                  <strong style="color: #334155;">Lokasyon:</strong><br>
                  <span style="color: #64748b; margin-left: 28px;">${eventDetails.location}</span>
                </p>
              </div>

              <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center; margin-top: 40px;">
                Enerjini yüksek tutmayı unutma! 💪 Görüşmek üzere.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">Bu mail Cluber sistemi tarafından otomatik gönderilmiştir.</p>
              <p style="color: #94a3b8; font-size: 13px; margin: 5px 0 0 0;">© ${new Date().getFullYear()} Club Connect</p>
            </div>
          </div>
        `,
      });
      this.logger.log(`Event reminder email sent to ${email}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Error sending event reminder email to ${email}`, error);
    }
  }
}
