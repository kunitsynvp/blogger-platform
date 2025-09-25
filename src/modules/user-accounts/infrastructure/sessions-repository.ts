import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  SessionDocument,
  SessionModelType,
} from '../domain/sessions/session.entity';
import { Session } from 'node:inspector';
import mongoose from 'mongoose';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { UserAccountsConfig } from '../config/users-accounts-config';
import {
  parseStringTimeFormatToSeconds,
} from '../../../core/helpers/parse-minites-string-to-seconds';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectModel(Session.name) private sessionModel: SessionModelType,
    private userConfig: UserAccountsConfig
  ) {}
  async save(session: SessionDocument): Promise<SessionDocument> {
    return await session.save();
  }
  async findSessionByDeviceIdOrFail(
    deviceId: string,
  ): Promise<SessionDocument> {
    const foundSession = await this.sessionModel.findOne({
      deviceId: deviceId,
    });
    if (!foundSession) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
        field: 'deviceId',
      });
    }
    return foundSession;
  }
  async terminateAllSessionsExcludeCurrent(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    await this.sessionModel.deleteMany({
      $and: [
        { userId: new mongoose.Types.ObjectId(userId) },
        { deviceId: { $ne: deviceId } },
      ],
    });
  }

  async terminateSpecifiedSession(deviceId: string): Promise<void> {
    await this.sessionModel.deleteOne({ deviceId: deviceId });
  }

  async isRefreshTokenValid(
    deviceId: string,
    iat: string,
    exp: string
  ): Promise<void> {
    const foundResult = await this.sessionModel.findOne({
      deviceId: deviceId,
      lastActiveDate: new Date(+iat * 1000).toISOString(),
    });

    const isTokenRefresh = +exp - +iat === parseStringTimeFormatToSeconds(this.userConfig.refreshTokenExpireIn)
    if (!foundResult || !isTokenRefresh) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: "Unauthorized",
        field: 'None',
      });
    }
  }
}