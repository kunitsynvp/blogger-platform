import { UsersRepository } from '../../../infrastructure/users.repository';
import { UsersFields } from '../../../domain/enums/users-fields';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CreateUserInputDto } from '../../../api/input-dto/create-user-dto';
import { CreateUserDomainOptions } from '../../../domain/dto/user-domain-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../users.service';

export class CreateUserCommand {
  constructor(
    public dto: CreateUserInputDto,
    public options: CreateUserDomainOptions,
  ) {}
}
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private usersService: UsersService,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const nonUniqueFields = await this.checkLoginEmailUniqueness(
      command.dto.login,
      command.dto.email,
    );
    if (nonUniqueFields)
      throw new DomainException({
        code: DomainExceptionCode.InvalidLogin,
        message: 'loginOrEmail already exist',
        field: nonUniqueFields,
      });

    return await this.usersService.createUser(command.dto, {
      createBySA: true,
    });
  }
  private async checkLoginEmailUniqueness(
    login: string,
    email: string,
  ): Promise<string | null> {
    const foundUserByLogin = await this.usersRepository.findByField(
      UsersFields.Login,
      login,
    );
    if (foundUserByLogin) {
      return 'login';
    }
    const foundUserByEmail = await this.usersRepository.findByField(
      UsersFields.Email,
      email,
    );
    if (foundUserByEmail) {
      return 'email';
    }
    return null;
  }
}