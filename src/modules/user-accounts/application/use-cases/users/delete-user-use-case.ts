import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSqlRepository } from '../../../infrastructure/users.sql.repository';

export class DeleteUserCommand {
  constructor(public id: number) {}
}
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersRepository: UsersSqlRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    return await this.usersRepository.deleteOrFail(command.id);
  }
}