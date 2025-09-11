import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import {Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserContextDto } from '../dto/user-context.dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';


@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.headers.authorization) {
      return false;
    }
    const authorizationString = request.headers.authorization;
    const [authType, accessToken] = authorizationString.split(" ");
    if (authType !== "Bearer") {
      return false
    }
    try {
      this.jwtService.verify(accessToken);
    } catch (e) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message:"unauthorized",
        field: "none"})

    }
    const dataFromJWT =  this.jwtService.decode(accessToken);
    request.user = {
      userId: dataFromJWT.userId,
    } as UserContextDto;

    return true;
  }
}