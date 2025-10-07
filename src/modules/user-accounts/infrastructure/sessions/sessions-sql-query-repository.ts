import { Injectable } from '@nestjs/common';
import { SessionViewDto } from '../../api/view-dto/session-view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Session } from '../../domain/sessions/session.entity';

@Injectable()
export class SessionsSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findActiveSessionsByUserId(userId: number): Promise<SessionViewDto[]> {
    const foundSessions: SessionsSqlDbType[] = await this.dataSource.query(
      `SELECT * FROM "Sessions" 
         WHERE "userId" = $1
         ORDER BY iat DESC`,
      [userId],
    );
    console.log('found sessions in db: ', foundSessions);
    const instances = plainToInstance(Session, foundSessions);

    return instances.map(SessionViewDto.mapToView);
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