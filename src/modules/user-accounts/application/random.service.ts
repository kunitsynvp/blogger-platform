import { v4 as uuid } from 'uuid';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RandomService {
  createUuid(): string {
    return uuid();
  }
  static createUuid(): string {
    return uuid();
  }
}
