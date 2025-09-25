import { UsersRepository } from '../../../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../../infrastructure/sessions-repository';

export class TerminateAllSessionsCommand {
  constructor(
    public userId: string,
    public deviceId: string,
  ) {}
}
@CommandHandler(TerminateAllSessionsCommand)
export class TerminateAllSessionsUseCase
  implements ICommandHandler<TerminateAllSessionsCommand, void>
{
  constructor(
    private sessionsRepository: SessionsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: TerminateAllSessionsCommand): Promise<void> {
    await this.usersRepository.findByIdOrUnauthorizedFail(command.userId);
    return await this.sessionsRepository.terminateAllSessionsExcludeCurrent(
      command.userId,
      command.deviceId,
    );
  }
}