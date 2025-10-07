import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../crypto.service';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ACCESS_TOKEN_INJECT_TOKEN,
  REFRESH_TOKEN_INJECT_TOKEN,
} from '../../../constants/jwt-tokens-inject-constants';
import { Inject } from '@nestjs/common';
import { RandomService } from '../../random.service';
import { SessionsService } from '../../sessions.service';
import { CreateSessionDto } from '../../dto/create-session-dto';
import { LoginUserCommandDto } from '../../dto/login-user-command-dto';
import { LoginUserDto } from '../../../api/input-dto/login-user-dto';
import { User } from '../../../domain/user/user.entity';
import { UsersSqlRepository } from '../../../infrastructure/users.sql.repository';

export class LoginCommand {
  constructor(public dto: LoginUserCommandDto) {}
}
@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_INJECT_TOKEN)
    private jwtAccessTokenService: JwtService,
    @Inject(REFRESH_TOKEN_INJECT_TOKEN)
    private jwtRefreshTokenService: JwtService,
    private cryptoService: CryptoService,
    private usersRepository: UsersSqlRepository,
    private randomService: RandomService,
    private sessionsService: SessionsService,
  ) {}

  async execute(
    command: LoginCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const loggedInUser: User = await this.checkCredentials(command.dto);

    const createdDeviceId = this.randomService.createUuid();

    const accessToken = this.jwtAccessTokenService.sign({
      userId: loggedInUser.id,
      deviceId: createdDeviceId,
    });
    const refreshToken = this.jwtRefreshTokenService.sign({
      userId: loggedInUser.id,
      deviceId: createdDeviceId,
    });
    const decodedRefreshToken =
      this.jwtRefreshTokenService.decode(refreshToken);
    const sessionDto = CreateSessionDto.createDto(
      command.dto.ip,
      command.dto.title,
      decodedRefreshToken.userId,
      createdDeviceId,
      new Date(+decodedRefreshToken.iat * 1000),
      new Date(+decodedRefreshToken.exp * 1000),
    );
    await this.sessionsService.createSession(sessionDto);

    return { accessToken: accessToken, refreshToken: refreshToken };
  }
  private async checkCredentials(dto: LoginUserDto): Promise<User> {
    const foundUser: User | null =
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