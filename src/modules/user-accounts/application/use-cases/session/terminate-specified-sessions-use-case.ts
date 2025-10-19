import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { SessionsRepository } from '../../../infrastructure/sessions/sessions-repository';
import { UsersRepository } from '../../../infrastructure/users-repository';

export class TerminateSpecifiedSessionCommand {
  constructor(
    public userId: number,
    public deviceIdURI: string,
  ) {}
}
@CommandHandler(TerminateSpecifiedSessionCommand)
export class TerminateSpecifiedSessionUseCase
  implements ICommandHandler<TerminateSpecifiedSessionCommand, void>
{
  constructor(
    private sessionsRepository: SessionsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: TerminateSpecifiedSessionCommand): Promise<void> {
    const foundUser = await this.usersRepository.findByIdOrFail(command.userId);

    const foundSession =
      await this.sessionsRepository.findSessionByDeviceIdOrFail(
        command.deviceIdURI,
      );

    if (foundSession.userId !== command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'This user doesn`t own this deviceId',
        field: 'deviceId',
      });
    }

    return await this.sessionsRepository.terminateSpecifiedSession(
      command.deviceIdURI,
    );
  }
}