import { UsersRepository } from '../../../infrastructure/users.repository';
import { UserDocument } from '../../../domain/user.entity';
import { ConfirmationCodeDto } from '../../../api/input-dto/confirmation-code-dto';
import { UsersFields } from '../../../domain/enums/users-fields';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ConfirmEmailCommand {
  constructor(public dto: ConfirmationCodeDto) {}
}
@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<void> {
    const user: UserDocument | null = await this.usersRepository.findByField(
      UsersFields.EmailConfirmationConfCode,
      command.dto.code,
    );
    this.checkExceptions(user!);

    user!.confirmEmail();

    await this.usersRepository.save(user!);
  }
  private checkExceptions(user: UserDocument) {
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeNotFound,
        message: 'confirmationCode does not exist',
        field: 'code',
      });
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.EmailAlreadyConfirmed,
        message: 'email already confirmed',
        field: 'code',
      });
    }
    if (!user.emailConfirmation.expirationDate) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'confirmation code expired',
        field: 'code',
      });
    }
    if (user.emailConfirmation.expirationDate < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'confirmation code expired',
        field: 'code',
      });
    }
  }
}