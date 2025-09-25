import { type INestApplication } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SessionsRepository } from '../../../../src/modules/user-accounts/infrastructure/sessions-repository';
import {
  Session,
  SessionModelType,
} from '../../../../src/modules/user-accounts/domain/sessions/session.entity';
import mongoose from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { UsersTestManager } from './users-test-manager';

export class SessionsTestManager {
  private readonly BasicAuthString: string = 'Basic YWRtaW46cXdlcnR5';

  private sessionRepository: SessionsRepository;
  private commandBus: CommandBus;
  private sessionModel: SessionModelType;
  private usersTestManager: UsersTestManager;

  constructor(private app: INestApplication) {
    this.sessionRepository =
      this.app.get<SessionsRepository>(SessionsRepository);
    this.commandBus = this.app.get<CommandBus>(CommandBus);
    this.sessionModel = this.app.get<SessionModelType>(
      getModelToken(Session.name),
    );
    this.usersTestManager = new UsersTestManager(app);
  }
  async getSessionByUserId(userId: string) {
    return this.sessionModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    });
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
      const { accessToken, refreshToken } =
        await this.usersTestManager.loginUser(login, password);
      aTokenArray.push(accessToken);
      rTokenArray.push(refreshToken);
    }
    return { aTokenArray, rTokenArray };
  }
}
