import { Injectable } from '@nestjs/common';
import { UpdateActiveSessionDomainDto } from '../domain/sessions/dto/update-active-session-domain-dto';
import { SessionsRepository } from '../infrastructure/sessions/sessions-repository';

@Injectable()
export class SessionsService {
  constructor(private sessionsRepository: SessionsRepository) {}

  async updateActiveSession(dto: UpdateActiveSessionDomainDto): Promise<void> {
    const sessionForUpdate =
      await this.sessionsRepository.findSessionByDeviceIdOrFail(dto.deviceId);
    sessionForUpdate.updateActiveSession(dto.iat, dto.exp);

    await this.sessionsRepository.save(sessionForUpdate);
  }
}