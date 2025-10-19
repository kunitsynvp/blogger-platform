import { EmailDto } from '../../../api/input-dto/email-dto';
import { PasswordRecoveryUserDomainDto } from '../../../domain/user/dto/user-domain-dto';
import { RandomService } from '../../random.service';
import { add } from 'date-fns';
import { EmailService } from '../../../../notifications/application/email.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users-repository';
import { PasswordRecoveryRepository } from '../../../infrastructure/password-recovery-repository';

export class SendRecoveryCodeCommand {
  constructor(public dto: EmailDto) {}
}
@CommandHandler(SendRecoveryCodeCommand)
export class SendRecoveryCodeUseCase
  implements ICommandHandler<SendRecoveryCodeCommand>
{
  constructor(
    private passwordRecoveryRepository: PasswordRecoveryRepository,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute(command: SendRecoveryCodeCommand): Promise<void> {
    const foundUser = await this.usersRepository.findByEmail(command.dto.email)
    if (!foundUser) {
      return;
    }
    const foundPassRec = await this.passwordRecoveryRepository.findByUserId(foundUser.id);
    const passwordRecoveryDto: PasswordRecoveryUserDomainDto = {
      recoveryCode: RandomService.createUuid(),
      expirationDate: add(new Date(), { hours: 1 }),
    };

    foundPassRec!.setPasswordRecovery(passwordRecoveryDto);

    await this.passwordRecoveryRepository.save(foundPassRec!)
    try {
      this.emailService.sendRecoveryCode(foundUser.email, foundPassRec!.recoveryCode as string);
    } catch (e) {
      console.error(e);
    }
  }
}