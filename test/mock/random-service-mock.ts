import { RandomService } from '../../src/modules/user-accounts/application/random.service';

export const mockedRandomServiceReturnedUUId =
  '519765ff-154d-46f3-afb1-65dca9a658d6';
export class MockedRandomService extends RandomService {
  static createUuid(): string {
    console.log('random service successfully mocked');
    return mockedRandomServiceReturnedUUId;
  }
}