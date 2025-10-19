import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users-repository';
import { SessionsRepository } from '../../../infrastructure/sessions/sessions-repository';

export class LogoutCommand {
  constructor(public userId: number,
              public deviceId: string) {}
}
@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, void> {
  constructor(private sessionsRepository: SessionsRepository,
              private usersRepository: UsersRepository,) {}

  async execute(command: LogoutCommand): Promise<void> {
    await this.usersRepository.findByIdOrUnauthorizedFail(command.userId);
    return await this.sessionsRepository.terminateSpecifiedSession(
      command.deviceId,
    );
  }
}