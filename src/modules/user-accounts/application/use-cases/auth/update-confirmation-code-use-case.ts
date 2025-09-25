import { UsersRepository } from '../../../infrastructure/users.repository';
import { UserDocument } from '../../../domain/user/user.entity';
import { UsersFields } from '../../../domain/user/enums/users-fields';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { EmailDto } from '../../../api/input-dto/email-dto';
import { EmailConfirmationUserDomainDto } from '../../../domain/user/dto/user-domain-dto';
import { RandomService } from '../../random.service';
import { add } from 'date-fns';
import { EmailService } from '../../../../notifications/application/email.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateConfirmationCodeCommand {
  constructor(public dto: EmailDto) {}
}
@CommandHandler(UpdateConfirmationCodeCommand)
export class UpdateConfirmationCodeUseCase
  implements ICommandHandler<UpdateConfirmationCodeCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute(command: UpdateConfirmationCodeCommand): Promise<void> {
    const foundUser = await this.usersRepository.findByField(
      UsersFields.Email,
      command.dto.email,
    );
    this.checkExceptions(foundUser!);

    const emailConfirmationDto: EmailConfirmationUserDomainDto = {
      confirmationCode: RandomService.createUuid(),
      expirationDate: add(new Date(), { hours: 1 }),
    };

    foundUser!.updateConfirmation(emailConfirmationDto);

    const updatedUser = await this.usersRepository.save(foundUser!);
    this.emailService.sendConfirmationCode(updatedUser);
  }
  private checkExceptions(user: UserDocument) {
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'email doesnt exist',
        field: 'email',
      });
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.EmailAlreadyConfirmed,
        message: 'email already confirmed',
        field: 'email',
      });
    }
  }
}