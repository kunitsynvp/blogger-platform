import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../../infrastructure/users.sql.repository';
import { SessionsSqlRepository } from '../../../infrastructure/sessions/sessions-sql-repository';

export class LogoutCommand {
  constructor(public userId: number,
              public deviceId: string) {}
}
@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, void> {
  constructor(private sessionsRepository: SessionsSqlRepository,
              private usersRepository: UsersSqlRepository,) {}

  async execute(command: LogoutCommand): Promise<void> {
    await this.usersRepository.findByIdOrUnauthorizedFail(command.userId);
    return await this.sessionsRepository.terminateSpecifiedSession(
      command.deviceId,
    );
  }
}