import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { EmailConfirmation } from '../domain/user/email-confirmation.entity';

@Injectable()
export class EmailConfirmationRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(EmailConfirmation)
    protected emailConfirmations: Repository<EmailConfirmation>,
  ) {}
  async save(ec: EmailConfirmation): Promise<EmailConfirmation> {
    return await this.emailConfirmations.save(ec);
  }

  async findByConfirmationCode(
    confirmationCode: string,
  ): Promise<EmailConfirmation | null> {
    const emailConfirmation = await this.emailConfirmations.findOne({
      where: { confirmationCode: confirmationCode },
    });

    return emailConfirmation;
  }
  async findByUserId(userId: number): Promise<EmailConfirmation> {
    const emailConfirmation = await this.emailConfirmations.findOne({
      where: { userId: userId },
      // relations: {
      //   user: {
      //     passwordRecovery: true,
      //   }
      // }
    });
    // if (!compoundUser) {
    //   return null;
    // }
    return emailConfirmation as EmailConfirmation;
  }
}
