import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailService: MailerService) {}
  async sendConfirmationCode(email: string, confirmationCode: string): Promise<void> {
    const mailOptions = {
      from: '"SuperService" <kunitsyntest@mail.ru>',
      to: email,
      subject: 'Thanks for your registration',
      html:
        '<h1>Thanks for your registration</h1>\n' +
        ' <p>To finish registration please follow the link below:\n' +
        `     <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>\n` +
        ' </p>', // HTML body
    };

    this.mailService.sendMail(mailOptions);
  }

  async sendRecoveryCode(email: string, recoveryCode: string) {
    const mailOptions = {
      from: '"SuperService" <kunitsyntest@mail.ru>',
      to: email,
      subject: 'Update password',
      html: `<h1>Password recovery</h1>
                   <p>To finish password recovery please follow the link 
                      <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
                   </p>`, // HTML body
    };

    this.mailService.sendMail(mailOptions);
  }
}