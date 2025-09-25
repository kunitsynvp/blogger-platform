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
import { ACCESS_TOKEN_INJECT_TOKEN } from '../../constants/jwt-tokens-inject-constants';

@Injectable()
export class JwtAccessTokenAuthGuard implements CanActivate {
  constructor(
    @Inject(ACCESS_TOKEN_INJECT_TOKEN)
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.headers.authorization) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: "unauthorized",
        field: "None"
      });
    }
    const authorizationString = request.headers.authorization;
    const [authType, accessToken] = authorizationString.split(' ');
    if (authType !== 'Bearer') {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: "unauthorized",
        field: "None"
      });
    }
    try {
      this.jwtService.verify(accessToken);
    } catch (e) {
      console.log(e);
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: "unauthorized",
        field: "None"
      });

    }
    const dataFromJWT = this.jwtService.decode(accessToken);
    request.user = {
      userId: dataFromJWT.userId,
      deviceId: dataFromJWT.deviceId,
      iat: new Date(+dataFromJWT.iat * 1000).toISOString(),
      exp: new Date(+dataFromJWT.exp * 1000).toISOString(),
    } as UserContextDto;
    return true;
  }
}