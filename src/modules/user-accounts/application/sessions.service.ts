import { Injectable } from '@nestjs/common';
import { Session } from '../domain/sessions/session.entity';
import { CreateSessionDto } from './dto/create-session-dto';
import { UpdateActiveSessionDomainDto } from '../domain/sessions/dto/update-active-session-domain-dto';
import { SessionsSqlRepository } from '../infrastructure/sessions/sessions-sql-repository';

@Injectable()
export class SessionsService {
  constructor(private sessionsRepository: SessionsSqlRepository) {}
  async createSession(dto: CreateSessionDto): Promise<void> {
    const createdSession = Session.createSession(dto);

    await this.sessionsRepository.createSession(createdSession);
  }
  async updateActiveSession(dto: UpdateActiveSessionDomainDto): Promise<void> {
    const sessionForUpdate =
      await this.sessionsRepository.findSessionByDeviceIdOrFail(dto.deviceId);
    sessionForUpdate.updateActiveSession(dto.iat, dto.exp);

    await this.sessionsRepository.updateActiveSession(sessionForUpdate);
  }
}