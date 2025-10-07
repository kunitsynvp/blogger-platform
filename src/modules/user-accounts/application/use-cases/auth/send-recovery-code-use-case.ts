import { EmailDto } from '../../../api/input-dto/email-dto';
import { PasswordRecoveryUserDomainDto } from '../../../domain/user/dto/user-domain-dto';
import { RandomService } from '../../random.service';
import { add } from 'date-fns';
import { EmailService } from '../../../../notifications/application/email.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../../infrastructure/users.sql.repository';

export class SendRecoveryCodeCommand {
  constructor(public dto: EmailDto) {}
}
@CommandHandler(SendRecoveryCodeCommand)
export class SendRecoveryCodeUseCase
  implements ICommandHandler<SendRecoveryCodeCommand>
{
  constructor(
    private usersRepository: UsersSqlRepository,
    private emailService: EmailService,
  ) {}

  async execute(command: SendRecoveryCodeCommand): Promise<void> {
    const foundUser = await this.usersRepository.findByEmail(command.dto.email);
    if (!foundUser) {
      return;
    }
    const passwordRecoveryDto: PasswordRecoveryUserDomainDto = {
      recoveryCode: RandomService.createUuid(),
      expirationDate: add(new Date(), { minutes: 10 }),
    };

    foundUser.setPasswordRecovery(passwordRecoveryDto);

    const updatedUser =
      await this.usersRepository.setPasswordRecovery(foundUser);
    try {
      this.emailService.sendRecoveryCode(foundUser);
    } catch (e) {
      console.error(e);
    }
  }
}