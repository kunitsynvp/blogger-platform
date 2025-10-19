import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UserAccountsConfig } from '../../config/users-accounts-config';
import { parseStringTimeFormatToSeconds } from '../../../../core/helpers/parse-minites-string-to-seconds';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { Session } from '../../domain/sessions/session.entity';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectRepository(Session) private sessions: Repository<Session>,
    private userConfig: UserAccountsConfig,
    @InjectDataSource() private dataSource: DataSource,
  ) {}
  async save(session: Session): Promise<Session> {
    return await this.sessions.save(session);
  }

  async findSessionByDeviceIdOrFail(deviceId: string): Promise<Session> {
    const foundSession = await this.sessions.findOneBy({ deviceId: deviceId });
    if (!foundSession) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
        field: 'deviceId',
      });
    }
    return foundSession;
  }
  async findSessionByUserId(userId: number): Promise<Session[]> {
    const foundSessions = await this.sessions.findBy({ userId: userId });
    return foundSessions;
  }
  async terminateAllSessionsExcludeCurrent(
    userId: number,
    deviceId: string,
  ): Promise<void> {
    // await this.dataSource.query(
    //   `DELETE FROM "Sessions" WHERE "userId" = $1 AND "deviceId" <> $2`,
    //   [userId, deviceId],
    // );
    await this.sessions.delete([{ userId: userId, deviceId: Not(deviceId) }]);
  }

  async terminateSpecifiedSession(deviceId: string): Promise<void> {
    await this.sessions.delete({ deviceId: deviceId });
  }

  async isRefreshTokenValid(
    deviceId: string,
    iat: string,
    exp: string,
  ): Promise<void> {
    const parsedIat = new Date(+iat * 1000);
    // const foundResult: UserDbType[] = await this.dataSource.query(
    //   `SELECT * FROM "Sessions" WHERE "deviceId" = $1 AND iat = $2`,
    //   [deviceId, parsedIat],
    // );
    const foundResult = await this.sessions.findOne({
      where: {
        deviceId: deviceId,
        iat: parsedIat,
      },
    });

    const isTokenRefresh =
      +exp - +iat ===
      parseStringTimeFormatToSeconds(this.userConfig.refreshTokenExpireIn);
    if (!foundResult) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
        field: 'session not found',
      });
    }
    if (!isTokenRefresh) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
        field: 'its not refresh token',
      });
    }
  }
}