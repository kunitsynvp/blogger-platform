import { UsersService } from '../../users.service';
import { EmailService } from '../../../../notifications/application/email.service';
import { CreateUserInputDto } from '../../../api/input-dto/create-user-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users-repository';
import { User } from '../../../domain/user/user.entity';
import { EmailConfirmationRepository } from '../../../infrastructure/email-confirmation-repository';

export class RegistrationCommand {
  constructor(public dto: CreateUserInputDto) {}
}
@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailConfirmationRepository: EmailConfirmationRepository,
    private emailService: EmailService,
    private usersService: UsersService,
  ) {}

  async execute(command: RegistrationCommand): Promise<void> {
    const isUserConfirmed = false;
    const createdUserId = await this.usersService.createUser(
      command.dto,
      isUserConfirmed,
    );

    const foundUser = await this.usersRepository.findById(createdUserId);
    const emailConfirmation = await this.emailConfirmationRepository.findByUserId(foundUser!.id)

    try {
      this.emailService.sendConfirmationCode(foundUser!.email, emailConfirmation.confirmationCode as string);
    } catch (e) {
      console.error(e);
    }
  }
}