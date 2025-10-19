import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { EmailDto } from '../../../api/input-dto/email-dto';
import { EmailConfirmationUserDomainDto } from '../../../domain/user/dto/user-domain-dto';
import { RandomService } from '../../random.service';
import { add } from 'date-fns';
import { EmailService } from '../../../../notifications/application/email.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users-repository';
import { EmailConfirmationRepository } from '../../../infrastructure/email-confirmation-repository';

export class UpdateConfirmationCodeCommand {
  constructor(public dto: EmailDto) {}
}
@CommandHandler(UpdateConfirmationCodeCommand)
export class UpdateConfirmationCodeUseCase
  implements ICommandHandler<UpdateConfirmationCodeCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
    private emailConfirmationRepository: EmailConfirmationRepository,
  ) {}

  async execute(command: UpdateConfirmationCodeCommand): Promise<void> {
    const foundUser = await this.usersRepository.findByEmail(command.dto.email);
    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'email doesnt exist',
        field: 'email',
      });
    }
    const emailConfirmation =
      await this.emailConfirmationRepository.findByUserId(foundUser.id);

    if (emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.EmailAlreadyConfirmed,
        message: 'email already confirmed',
        field: 'email',
      });
    }

    const emailConfirmationDto: EmailConfirmationUserDomainDto = {
      confirmationCode: RandomService.createUuid(),
      expirationDate: add(new Date(), { hours: 1 }),
    };

    emailConfirmation!.updateConfirmation(emailConfirmationDto);

    await this.emailConfirmationRepository.save(emailConfirmation);

    this.emailService.sendConfirmationCode(foundUser);
  }
}