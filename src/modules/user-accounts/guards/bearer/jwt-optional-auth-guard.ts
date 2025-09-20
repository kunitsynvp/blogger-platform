import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import {Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserContextDto } from '../dto/user-context.dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { ACCESS_TOKEN_INJECT_TOKEN } from '../../constants/jwt-tokens-inject-constants';


@Injectable()
export class JwtOptionalAuthGuard implements CanActivate {
  constructor(
    @Inject(ACCESS_TOKEN_INJECT_TOKEN) private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const authorizationString = request.headers.authorization;
      const [authType, accessToken] = authorizationString!.split(' ');
      this.jwtService.verify(accessToken);
      const dataFromJWT = this.jwtService.decode(accessToken);
      request.user = {
        userId: dataFromJWT.userId,
      } as UserContextDto;
      return true;

    } catch (e) {
      return true
    }
  }
}