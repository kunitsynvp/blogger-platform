import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';

@Injectable()
export class CustomParseIntPipe
  implements PipeTransform<string, number>
{
  transform(value: string, metadata: ArgumentMetadata): number {
    const int = parseInt(value,10);
    if (Number.isNaN(int)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound, //TODO remove after hw 21
        message:"Not valid id",
        field: 'id'
      });
    }
    return int
  }
}