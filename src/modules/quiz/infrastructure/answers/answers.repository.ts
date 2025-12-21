import { DataSource, Repository } from 'typeorm';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Answer } from '../../domain/answers/answers.entity';
import { BaseRepository } from '../../../../core/base repo/base-repository';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class AnswersRepository extends BaseRepository {
  private answers: Repository<Answer>;
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
    this.answers = this.getRepository(Answer);
  }

  async save(answer: Answer): Promise<Answer> {
    return await this.answers.save(answer);
  }
}
