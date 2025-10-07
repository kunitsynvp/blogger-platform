import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { EmailDto } from '../../../api/input-dto/email-dto';
import { EmailConfirmationUserDomainDto } from '../../../domain/user/dto/user-domain-dto';
import { RandomService } from '../../random.service';
import { add } from 'date-fns';
import { EmailService } from '../../../../notifications/application/email.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../../infrastructure/users.sql.repository';
import { User } from '../../../domain/user/user.entity';

export class UpdateConfirmationCodeCommand {
  constructor(public dto: EmailDto) {}
}
@CommandHandler(UpdateConfirmationCodeCommand)
export class UpdateConfirmationCodeUseCase
  implements ICommandHandler<UpdateConfirmationCodeCommand>
{
  constructor(
    private usersRepository: UsersSqlRepository,
    private emailService: EmailService,
  ) {}

  async execute(command: UpdateConfirmationCodeCommand): Promise<void> {
    const foundUser = await this.usersRepository.findByEmail(command.dto.email);
    this.checkExceptions(foundUser!);

    const emailConfirmationDto: EmailConfirmationUserDomainDto = {
      confirmationCode: RandomService.createUuid(),
      expirationDate: add(new Date(), { hours: 1 }),
    };

    foundUser!.updateConfirmation(emailConfirmationDto);

    await this.usersRepository.updateConfirmationCode(foundUser!);
    this.emailService.sendConfirmationCode(foundUser!);
  }
  private checkExceptions(user: User) {
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'email doesnt exist',
        field: 'email',
      });
    }
    if (user.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.EmailAlreadyConfirmed,
        message: 'email already confirmed',
        field: 'email',
      });
    }
  }
}