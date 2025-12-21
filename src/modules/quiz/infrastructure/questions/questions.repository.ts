import { Question } from '../../domain/questions/question.entity';
import { DataSource, Repository } from 'typeorm';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { BaseRepository } from '../../../../core/base repo/base-repository';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class QuestionsRepository extends BaseRepository {
  private questions: Repository<Question>;
  constructor(dataSource: DataSource, @Inject(REQUEST) req: Request) {
    super(dataSource, req);
    this.questions = this.getRepository(Question);
  }

  async save(question: Question): Promise<Question> {
    return await this.questions.save(question);
  }
  async findByIdOrFail(id: number): Promise<Question> {
    const foundQuestion = await this.questions.findOneBy({ id: id });
    if (!foundQuestion) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Question not found',
        field: 'id',
      });
    }
    return foundQuestion;
  }
  async deleteQuestion(questionId: number): Promise<void> {
    await this.questions.delete({ id: questionId });
  }
  async findFiveRandomPublishedQuestions(): Promise<number[]> {
    const foundQuestionIds = await this.questions
      .createQueryBuilder('q')
      .select('q.id as id')
      .where({ isPublished: true })
      .orderBy('RANDOM()')
      .limit(5)
      .getRawMany<{ id: number }>();
    if (foundQuestionIds.length < 5) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'There are no 5 published questions in system',
        field: 'None',
      });
    }
    return foundQuestionIds.map((q) => q.id);
  }
  async getNotAnsweredQuestionsForUserAndGame(
    userId: number,
    gameId: string,
  ): Promise<NotAnsweredQuestionsDBRaw[]> {
    const foundNotAnsweredQuestions = await this.questions
      .createQueryBuilder('q')
      .select([
        'q.id as "questionId"',
        'q."correctAnswers" as "correctAnswers"',
        'p.id as "playerId"',
      ])
      .innerJoin('q.gameQuestions', 'gq')
      .innerJoin('gq.game', 'g')
      .innerJoin('g.players', 'p')
      .leftJoin('p.answers', 'a', 'a."questionId" = q.id')
      .where('p."userId" = :userId', { userId: userId })
      .andWhere('a.id is null')
      .andWhere('g.id = :gameId', { gameId: gameId })
      .orderBy('gq.id', 'ASC')
      .limit(5)
      .getRawMany<NotAnsweredQuestionsDBRaw>();
    return foundNotAnsweredQuestions;
  }
  async getCountOfNotAnsweredQuestionsForGame(gameId: string): Promise<number> {
    const foundNotAnsweredQuestions = await this.questions
      .createQueryBuilder('q')
      .innerJoin('q.gameQuestions', 'gq')
      .innerJoin('gq.game', 'g')
      .innerJoin('g.players', 'p')
      .leftJoin('p.answers', 'a', 'a."questionId" = q.id')
      .where('a.id is null')
      .andWhere('g.id = :gameId', { gameId: gameId })
      .orderBy('gq.id', 'ASC')
      .getCount();
    console.log('foundNotAnsweredQuestions', foundNotAnsweredQuestions);
    return foundNotAnsweredQuestions;
  }
}
export type NotAnsweredQuestionsDBRaw = {
  questionId: number;
  correctAnswers: string[];
  playerId: number;
};
