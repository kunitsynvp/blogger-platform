import { EmailService } from '../../src/modules/notifications/application/email.service';

export class MockedEmailService extends EmailService{

  async sendConfirmationCode(email: string, confirmationCode: string): Promise<void> {
    //console.log('Confirmation code successfully sent');
  }
  async sendRecoveryCode(email: string, recoveryCode: string): Promise<void> {
    //console.log('Recovery code successfully sent');
  }
}