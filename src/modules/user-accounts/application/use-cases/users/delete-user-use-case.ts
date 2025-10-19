import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users-repository';

export class DeleteUserCommand {
  constructor(public id: number) {}
}
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    return await this.usersRepository.deleteOrFail(command.id);
  }
}