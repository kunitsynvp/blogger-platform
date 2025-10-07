import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsSqlRepository } from '../../../infrastructure/sessions/sessions-sql-repository';
import { UsersSqlRepository } from '../../../infrastructure/users.sql.repository';

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
    private sessionsRepository: SessionsSqlRepository,
    private usersRepository: UsersSqlRepository,
  ) {}

  async execute(command: TerminateAllSessionsCommand): Promise<void> {
    await this.usersRepository.findByIdOrUnauthorizedFail(command.userId);
    return await this.sessionsRepository.terminateAllSessionsExcludeCurrent(
      command.userId,
      command.deviceId,
    );
  }
}