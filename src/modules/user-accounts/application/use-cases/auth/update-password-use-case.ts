import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { NewPasswordDto } from '../../../api/input-dto/new-password-dto';
import { CryptoService } from '../../crypto.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../../infrastructure/users.sql.repository';
import { User } from '../../../domain/user/user.entity';

export class UpdatePasswordCommand {
  constructor(public dto: NewPasswordDto) {}
}
@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(
    private usersRepository: UsersSqlRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(command: UpdatePasswordCommand): Promise<void> {
    const foundUser: User | null =
      await this.usersRepository.findByRecoveryCode(command.dto.recoveryCode);
    this.checkExceptions(foundUser!);

    const newHashPassword = await this.cryptoService.generateHash(
      command.dto.newPassword,
    );
    foundUser!.updatePassword(newHashPassword);
    await this.usersRepository.updatePassword(foundUser!);
  }
  private checkExceptions(user: User) {
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'password recovery does not exist',
        field: 'recoveryCode',
      });
    }

    if (!user.recoveryExpDate) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'password recovery expired',
        field: 'recoveryCode',
      });
    }
    if (user.recoveryExpDate < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'password recovery expired',
        field: 'recoveryCode',
      });
    }
  }
}