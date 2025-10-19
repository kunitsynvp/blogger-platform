import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordRecovery } from '../domain/user/password-recovery.entity';

@Injectable()
export class PasswordRecoveryRepository {
  constructor(
    @InjectRepository(PasswordRecovery)
    protected passwordRecoveries: Repository<PasswordRecovery>,
  ) {}
  async save(pc: PasswordRecovery): Promise<PasswordRecovery> {
    return await this.passwordRecoveries.save(pc);
  }

  async findByUserId(userId: number): Promise<PasswordRecovery | null> {
    const foundPassRec = await this.passwordRecoveries.findOneBy({
      userId: userId,
    });
    if (!foundPassRec) {
      return null;
    }
    return foundPassRec;
  }
  async findByRecoveryCode(
    recoveryCode: string,
  ): Promise<PasswordRecovery | null> {
    const passRecovery = await this.passwordRecoveries.findOneBy({
      recoveryCode: recoveryCode,
    });
    return passRecovery;
  }
}
