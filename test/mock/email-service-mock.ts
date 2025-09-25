import { EmailService } from '../../src/modules/notifications/application/email.service';
import { UserDocument } from '../../src/modules/user-accounts/domain/user/user.entity';

export class MockedEmailService extends EmailService{

  async sendConfirmationCode(user: UserDocument): Promise<void> {
    console.log('Confirmation code successfully sent');
  }
  async sendRecoveryCode(user: UserDocument): Promise<void> {
    console.log('Recovery code successfully sent');
  }
}