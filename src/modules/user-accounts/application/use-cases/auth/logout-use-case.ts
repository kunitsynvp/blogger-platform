import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../../../infrastructure/sessions-repository';
import { UsersRepository } from '../../../infrastructure/users.repository';

export class LogoutCommand {
  constructor(public userId: string,
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