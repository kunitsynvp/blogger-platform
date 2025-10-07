import { CreateUserInputDto } from '../../../api/input-dto/create-user-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users.service';

export class CreateUserCommand {
  constructor(public dto: CreateUserInputDto) {}
}
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(private usersService: UsersService) {}

  async execute(command: CreateUserCommand): Promise<number> {
    const isUserConfirmed = true;
    return await this.usersService.createUser(command.dto, isUserConfirmed);
  }
}