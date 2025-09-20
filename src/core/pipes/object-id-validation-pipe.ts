import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';

@Injectable()
export class ObjectIdValidationPipe
  implements PipeTransform<string, string>
{
  transform(value: string, metadata: ArgumentMetadata): string {
    const validObjectId = Types.ObjectId.isValid(value);
    if (!validObjectId) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message:"Not valid id",
        field: 'id'
      });
    }
    return value
  }
}