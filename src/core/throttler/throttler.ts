import { ThrottlerException, ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    try {
      return await super.handleRequest(requestProps);
    } catch (error) {
      if(error instanceof ThrottlerException) {
        throw new DomainException({
          code: DomainExceptionCode.TooManyRequests,
          message: 'Too many requests',
          field: 'None',
        });
      }
      throw error;
    }
  }
}