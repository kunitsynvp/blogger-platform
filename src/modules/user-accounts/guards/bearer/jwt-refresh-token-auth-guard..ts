import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserContextDto } from '../dto/user-context.dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import {
  REFRESH_TOKEN_INJECT_TOKEN,
} from '../../constants/jwt-tokens-inject-constants';
import { SessionsSqlRepository } from '../../infrastructure/sessions/sessions-sql-repository';

@Injectable()
export class JwtRefreshTokenAuthGuard implements CanActivate {
  constructor(
    @Inject(REFRESH_TOKEN_INJECT_TOKEN) private jwtService: JwtService,
    private sessionsRepository: SessionsSqlRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.cookies.refreshToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: "unauthorized",
        field: "no cookies"
      });
    }
    const refreshToken = request.cookies.refreshToken;

    try {
      this.jwtService.verify(refreshToken);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: "unauthorized",
        field: "failed verify"
      });
    }
    const dataFromJWT = this.jwtService.decode(refreshToken);
    await this.sessionsRepository.isRefreshTokenValid(
      dataFromJWT.deviceId,
      dataFromJWT.iat,
      dataFromJWT.exp
    )
    request.user = {
      userId: dataFromJWT.userId,
      deviceId: dataFromJWT.deviceId,
      iat: new Date(+dataFromJWT.iat * 1000),
      exp: new Date(+dataFromJWT.exp * 1000),
    } as UserContextDto;
    return true;
  }
}