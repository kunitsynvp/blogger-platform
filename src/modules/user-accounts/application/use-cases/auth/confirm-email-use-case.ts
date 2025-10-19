import { ConfirmationCodeDto } from '../../../api/input-dto/confirmation-code-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EmailConfirmationRepository } from '../../../infrastructure/email-confirmation-repository';
import { EmailConfirmation } from '../../../domain/user/email-confirmation.entity';

export class ConfirmEmailCommand {
  constructor(public dto: ConfirmationCodeDto) {}
}
@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private emailConfRepository: EmailConfirmationRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<void> {
    const emailConfirmation: EmailConfirmation | null =
      await this.emailConfRepository.findByConfirmationCode(command.dto.code);
    this.checkExceptions(emailConfirmation!);

    emailConfirmation!.confirmEmail();

    await this.emailConfRepository.save(emailConfirmation!);
  }
  private checkExceptions(emailConfirmation: EmailConfirmation) {
    if (!emailConfirmation) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeNotFound,
        message: 'confirmationCode does not exist',
        field: 'code',
      });
    }
    if (emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.EmailAlreadyConfirmed,
        message: 'email already confirmed',
        field: 'code',
      });
    }

    if (!emailConfirmation.expirationDate) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'confirmation code expired',
        field: 'code',
      });
    }
    if (emailConfirmation.expirationDate < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'confirmation code expired',
        field: 'code',
      });
    }
  }
}