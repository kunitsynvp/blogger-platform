import { v4 as uuid } from 'uuid';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RandomService {
  static createUuid(): string {
    return uuid();
  }
}
