import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { NewPasswordDto } from '../../../api/input-dto/new-password-dto';
import { CryptoService } from '../../crypto.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users-repository';
import { User } from '../../../domain/user/user.entity';
import { PasswordRecoveryRepository } from '../../../infrastructure/password-recovery-repository';
import { PasswordRecovery } from '../../../domain/user/password-recovery.entity';

export class UpdatePasswordCommand {
  constructor(public dto: NewPasswordDto) {}
}
@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private passwordRecoveryRepository: PasswordRecoveryRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(command: UpdatePasswordCommand): Promise<void> {
    const passwordRecovery =
      await this.passwordRecoveryRepository.findByRecoveryCode(
        command.dto.recoveryCode,
      );
    this.checkExceptions(passwordRecovery!);
    const foundUser: User | null = await this.usersRepository.findById(
      passwordRecovery!.userId,
    );

    const newHashPassword = await this.cryptoService.generateHash(
      command.dto.newPassword,
    );
    foundUser!.updatePassword(newHashPassword);
    await this.usersRepository.save(foundUser!);
  }
  private checkExceptions(pr: PasswordRecovery) {
    if (!pr) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'password recovery does not exist',
        field: 'recoveryCode',
      });
    }
    if (!pr.expirationDate) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'password recovery expired',
        field: 'recoveryCode',
      });
    }
    if (pr.expirationDate < new Date()) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'password recovery expired',
        field: 'recoveryCode',
      });
    }
  }
}