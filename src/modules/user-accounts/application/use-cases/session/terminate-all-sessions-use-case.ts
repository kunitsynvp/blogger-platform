import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../../infrastructure/sessions/sessions-repository';
import { UsersRepository } from '../../../infrastructure/users-repository';

export class TerminateAllSessionsCommand {
  constructor(
    public userId: number,
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