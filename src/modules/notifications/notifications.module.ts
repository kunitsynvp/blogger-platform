import { Module } from '@nestjs/common';
import { EmailService } from './application/email.service';

@Module({
  imports: [],
  providers: [EmailService],
  controllers: [],
  exports: [EmailService],
})
export class NotificationsModule {}