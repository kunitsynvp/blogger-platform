import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../../infrastructure/sessions-repository';
import { UsersExternalRepository } from '../../../infrastructure/external/users.external.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class TerminateSpecifiedSessionCommand {
  constructor(
    public userId: string,
    public deviceIdURI: string,
  ) {}
}
@CommandHandler(TerminateSpecifiedSessionCommand)
export class TerminateSpecifiedSessionUseCase
  implements ICommandHandler<TerminateSpecifiedSessionCommand, void>
{
  constructor(
    private sessionsRepository: SessionsRepository,
    private usersRepository: UsersExternalRepository,
  ) {}

  async execute(command: TerminateSpecifiedSessionCommand): Promise<void> {
    const foundUser = await this.usersRepository.findByIdOrFail(command.userId);

    const foundSession =
      await this.sessionsRepository.findSessionByDeviceIdOrFail(
        command.deviceIdURI,
      );

    if (foundSession.userId.toString() !== command.userId) {
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