import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UserAccountsConfig } from '../../config/users-accounts-config';
import { parseStringTimeFormatToSeconds } from '../../../../core/helpers/parse-minites-string-to-seconds';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SessionsSqlDbType } from './sessions-sql-query-repository';
import { plainToInstance } from 'class-transformer';
import { Session } from '../../domain/sessions/session.entity';
import { UserDbType } from '../../domain/user/user.entity';

@Injectable()
export class SessionsSqlRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private userConfig: UserAccountsConfig,
  ) {}
  // async save(session: SessionDocument): Promise<SessionDocument> {
  //   return await session.save();
  // }
  async createSession(session: Session){
    console.log("iat in create session repo: ",session.iat);
    const result = await this.dataSource.query(
      `INSERT INTO "Sessions"(ip,title,"userId","deviceId",iat,exp)
            VALUES ($1,$2,$3,$4,$5,$6)`,
      [session.ip,session.title,session.userId,session.deviceId,session.iat,session.exp]
    )
  }
  async updateActiveSession(session: Session){
    await this.dataSource.query(
      `UPDATE "Sessions"
      SET iat = $2,
          exp = $3
      WHERE "deviceId" = $1`,
      [session.deviceId,session.iat,session.exp]
    )
  }
  async findSessionByDeviceIdOrFail(
    deviceId: string,
  ): Promise<Session> {
    const foundSession: SessionsSqlDbType[] = await this.dataSource.query(
      `SELECT * FROM "Sessions" WHERE "deviceId" = $1`,
      [deviceId],
    );
    if (foundSession.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
        field: 'deviceId',
      });
    }
    return plainToInstance(Session, foundSession[0]);
  }
  async findSessionByUserId(
    userId: number,
  ): Promise<Session[]> {
    const foundSessions: SessionsSqlDbType[] = await this.dataSource.query(
      `SELECT * FROM "Sessions" WHERE "userId" = $1`,
      [userId],
    );
    return plainToInstance(Session, foundSessions);
  }
  async terminateAllSessionsExcludeCurrent(
    userId: number,
    deviceId: string,
  ): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM "Sessions" WHERE "userId" = $1 AND "deviceId" <> $2`,
      [userId, deviceId],
    );
  }

  async terminateSpecifiedSession(deviceId: string): Promise<void> {
    await this.dataSource.query(
      `DELETE FROM "Sessions" WHERE "deviceId" = $1`,
      [deviceId],
    );
  }

  async isRefreshTokenValid(
    deviceId: string,
    iat: string,
    exp: string,
  ): Promise<void> {
    const parsedIat = new Date(+iat * 1000);
    const foundResult: UserDbType[] = await this.dataSource.query(
      `SELECT * FROM "Sessions" WHERE "deviceId" = $1 AND iat = $2`,
      [deviceId, parsedIat],
    );

    const isTokenRefresh =
      +exp - +iat ===
      parseStringTimeFormatToSeconds(this.userConfig.refreshTokenExpireIn);
    if (foundResult.length === 0 ) {
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