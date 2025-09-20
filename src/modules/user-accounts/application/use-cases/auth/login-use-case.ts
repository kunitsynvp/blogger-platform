import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../crypto.service';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { LoginUserDTO } from '../../../api/input-dto/login-user-dto';
import { UserDocument } from '../../../domain/user.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ACCESS_TOKEN_INJECT_TOKEN } from '../../../constants/jwt-tokens-inject-constants';
import { Inject } from '@nestjs/common';

export class LoginCommand {
  constructor(public dto: LoginUserDTO) {}
}
@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_INJECT_TOKEN) private jwtService: JwtService,
    private cryptoService: CryptoService,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: LoginCommand): Promise<{ accessToken: string }> {
    const loggedInUser: UserDocument = await this.checkCredentials(command.dto);

    const accessToken = this.jwtService.sign({
      userId: loggedInUser._id.toString(),
    });


    return { accessToken: accessToken };
  }
  private async checkCredentials(dto: LoginUserDTO): Promise<UserDocument> {
    const foundUser: UserDocument | null =
      await this.usersRepository.findByLoginOrEmail(dto.loginOrEmail);

    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'unauthorized',
        field: 'none',
      });
    }
    const isPasswordCorrect = await this.cryptoService.comparePassword(
      dto.password,
      foundUser.passwordHash,
    );
    if (!isPasswordCorrect) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'unauthorized',
        field: 'none',
      });
    }
    return foundUser;
  }
}