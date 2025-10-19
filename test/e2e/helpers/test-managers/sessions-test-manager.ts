import { type INestApplication } from '@nestjs/common';
import { UsersTestManager } from './users-test-manager';
import { SessionsRepository } from '../../../../src/modules/user-accounts/infrastructure/sessions/sessions-repository';
import { delay } from '../delay';

export class SessionsTestManager {
  private readonly BasicAuthString: string = 'Basic YWRtaW46cXdlcnR5';

  private sessionRepository: SessionsRepository;
  private usersTestManager: UsersTestManager;

  constructor(private app: INestApplication) {
    this.sessionRepository = this.app.get<SessionsRepository>(
      SessionsRepository,
    );
    this.usersTestManager = new UsersTestManager(app);
  }
  async getSessionByUserId(userId: number) {
    return this.sessionRepository.findSessionByUserId(userId);
  }
  async deleteSpecifiedSession(deviceId: string) {
    return await this.sessionRepository.terminateSpecifiedSession(deviceId);
  }
  async createSeveralSessionsForCurrentUser(
    count: number,
    login: string,
    password: string,
  ) {
    const rTokenArray: Array<string> = [];
    const aTokenArray: Array<string> = [];
    for (let i = 0; i < count; i++) {
      await delay(1000)
      console.log("date in method: ",new Date());

      const { accessToken, refreshToken } = await this.usersTestManager.loginUser(login, password);
      aTokenArray.push(accessToken);
      rTokenArray.push(refreshToken);
    }
    return { aTokenArray, rTokenArray };
  }
}
