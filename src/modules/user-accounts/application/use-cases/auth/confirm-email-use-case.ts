import { ConfirmationCodeDto } from '../../../api/input-dto/confirmation-code-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../../infrastructure/users.sql.repository';
import { User } from '../../../domain/user/user.entity';

export class ConfirmEmailCommand {
  constructor(public dto: ConfirmationCodeDto) {}
}
@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private usersRepository: UsersSqlRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<void> {
    const user: User | null = await this.usersRepository.findByConfirmationCode(
      command.dto.code,
    );
    this.checkExceptions(user!);

    user!.confirmEmail();

    await this.usersRepository.confirmUser(user!);
  }
  private checkExceptions(user: User) {
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeNotFound,
        message: 'confirmationCode does not exist',
        field: 'code',
      });
    }
    if (user.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.EmailAlreadyConfirmed,
        message: 'email already confirmed',
        field: 'code',
      });
    }
    if (!user.confirmationExpDate) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'confirmation code expired',
        field: 'code',
      });
    }
    if (user.confirmationExpDate < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'confirmation code expired',
        field: 'code',
      });
    }
  }
}