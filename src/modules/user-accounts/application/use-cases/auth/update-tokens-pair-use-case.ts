import { JwtService } from '@nestjs/jwt';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { AccessAndRefreshToken } from '../../dto/access-and-refresh-token';
import {
  ACCESS_TOKEN_INJECT_TOKEN,
  REFRESH_TOKEN_INJECT_TOKEN,
} from '../../../constants/jwt-tokens-inject-constants';
import { Inject } from '@nestjs/common';
import { UpdateActiveSessionDomainDto } from '../../../domain/sessions/dto/update-active-session-domain-dto';
import { SessionsService } from '../../sessions.service';
import { UsersRepository } from '../../../infrastructure/users-repository';

export class UpdateTokensPairCommand {
  constructor(
    public userId: number,
    public deviceId: string,
  ) {}
}
@CommandHandler(UpdateTokensPairCommand)
export class UpdateTokensPairUseCase
  implements ICommandHandler<UpdateTokensPairCommand, AccessAndRefreshToken>
{
  constructor(
    private usersRepository: UsersRepository,
    @Inject(ACCESS_TOKEN_INJECT_TOKEN)
    private jwtAccessTokenService: JwtService,
    @Inject(REFRESH_TOKEN_INJECT_TOKEN)
    private jwtRefreshTokenService: JwtService,
    private sessionsService: SessionsService,
  ) {}

  async execute(
    command: UpdateTokensPairCommand,
  ): Promise<AccessAndRefreshToken> {
    const foundUser = await this.usersRepository.findById(command.userId);
    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
        field: 'None',
      });
    }

    const newAccessToken = this.jwtAccessTokenService.sign({
      userId: command.userId,
      deviceId: command.deviceId,
    });
    const newRefreshToken = this.jwtRefreshTokenService.sign({
      userId: command.userId,
      deviceId: command.deviceId,
    });

    const decodedRefreshToken =
      this.jwtRefreshTokenService.decode(newRefreshToken);
    const iat = new Date(+decodedRefreshToken.iat * 1000);
    const exp = new Date(+decodedRefreshToken.exp * 1000);


    const updateSessionDto = UpdateActiveSessionDomainDto.createDto(
      decodedRefreshToken.deviceId,
      iat,
      exp,
    );

    await this.sessionsService.updateActiveSession(updateSessionDto);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}