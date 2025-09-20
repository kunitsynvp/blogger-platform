import { UsersRepository } from '../../../infrastructure/users.repository';
import { UserDocument } from '../../../domain/user.entity';
import { UsersFields } from '../../../domain/enums/users-fields';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { NewPasswordDto } from '../../../api/input-dto/new-password-dto';
import { CryptoService } from '../../crypto.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdatePasswordCommand {
  constructor(public dto: NewPasswordDto) {}
}
@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(command: UpdatePasswordCommand): Promise<void> {
    const foundUser: UserDocument | null =
      await this.usersRepository.findByField(
        UsersFields.PasswordRecoveryRecCode,
        command.dto.recoveryCode,
      );
    this.checkExceptions(foundUser!);

    const newHashPassword = await this.cryptoService.generateHash(
      command.dto.newPassword,
    );
    foundUser!.updatePassword(newHashPassword);
    await this.usersRepository.save(foundUser!);
  }
  private checkExceptions(user: UserDocument) {
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'password recovery does not exist',
        field: 'recoveryCode',
      });
    }

    if (!user.passwordRecovery.expirationDate) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'password recovery expired',
        field: 'recoveryCode',
      });
    }

    if (user.passwordRecovery.expirationDate < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'password recovery expired',
        field: 'recoveryCode',
      });
    }
  }
}