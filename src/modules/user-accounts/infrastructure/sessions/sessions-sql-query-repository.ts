import { Injectable } from '@nestjs/common';
import { SessionViewDto } from '../../api/view-dto/session-view-dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Session } from '../../domain/sessions/session.entity';

@Injectable()
export class SessionsSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource,
              @InjectRepository(Session) private sessions: Repository<Session>,) {}
  async findActiveSessionsByUserId(userId: number): Promise<SessionViewDto[]> {
    // const foundSessions: SessionsSqlDbType[] = await this.dataSource.query(
    //   `SELECT * FROM "Sessions"
    //      WHERE "userId" = $1
    //      ORDER BY iat DESC`,
    //   [userId],
    // );
    // const instances = plainToInstance(Session, foundSessions);
    //
    // return instances.map(SessionViewDto.mapToView);

    const foundSessions = await this.sessions.find({
      where: {
        userId: userId,
      }
    })
    return foundSessions.map(SessionViewDto.mapToView)
  }
}
export type SessionsSqlDbType = {
  id: number;
  ip: string;
  title: string;
  userId: number;
  deviceId: string;
  iat: Date;
  exp: Date;
};