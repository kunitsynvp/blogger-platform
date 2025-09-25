import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';
import { parse as uuidParse } from 'uuid';

@Injectable()
export class UuidValidationPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    try {
      uuidParse(value);
    } catch (e) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Not valid uuid',
        field: 'deviceId',
      });
    }
    return value;
  }
}