import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { SessionModelType } from '../domain/sessions/session.entity';
import { Session } from '../domain/sessions/session.entity';
import { CreateSessionDto } from './dto/create-session-dto';
import { SessionsRepository } from '../infrastructure/sessions-repository';
import { UpdateActiveSessionDomainDto } from '../domain/sessions/dto/update-active-session-domain-dto';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: SessionModelType,
    private sessionRepository: SessionsRepository,
    private sessionsRepository: SessionsRepository,
  ) {}
  async createSession(dto: CreateSessionDto): Promise<void> {
    const createdSession = this.sessionModel.createSession(dto);

    await this.sessionRepository.save(createdSession);
  }
  async updateActiveSession(dto: UpdateActiveSessionDomainDto): Promise<void> {
    const sessionForUpdate = await this.sessionModel.findOne({
      deviceId: dto.deviceId,
    });

    if (!sessionForUpdate) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: "unauthorized",
        field: 'None',
      });
    }
    sessionForUpdate.updateActiveSession(dto.iat, dto.exp);

    await this.sessionsRepository.save(sessionForUpdate);

  }
}