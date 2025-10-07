import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserContextDto } from '../dto/user-context.dto';
import { ACCESS_TOKEN_INJECT_TOKEN } from '../../constants/jwt-tokens-inject-constants';

@Injectable()
export class JwtOptionalAuthGuard implements CanActivate {
  constructor(
    @Inject(ACCESS_TOKEN_INJECT_TOKEN)
    private jwtAccessTokenService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const authorizationString = request.headers.authorization;
      const [authType, accessToken] = authorizationString!.split(' ');
      this.jwtAccessTokenService.verify(accessToken);
      const dataFromJWT = this.jwtAccessTokenService.decode(accessToken);
      request.user = {
        userId: dataFromJWT.userId,
        deviceId: dataFromJWT.deviceId,
        iat: new Date(+dataFromJWT.iat * 1000),
        exp: new Date(+dataFromJWT.exp * 1000),
      } as UserContextDto;
      return true;
    } catch (e) {
      return true;
    }
  }
}