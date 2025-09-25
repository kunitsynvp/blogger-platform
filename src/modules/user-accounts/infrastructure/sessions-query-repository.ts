import { Injectable } from '@nestjs/common';
import type { SessionModelType } from '../domain/sessions/session.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from 'node:inspector';
import mongoose from 'mongoose';
import { SessionViewDto } from '../api/view-dto/session-view-dto';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectModel(Session.name) private sessionModel: SessionModelType,
  ) {}
  async findActiveSessionsByUserId(userId: string): Promise<SessionViewDto[]> {
    const foundSessions = await this.sessionModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    return foundSessions.map(SessionViewDto.mapToView);
  }
}