import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../domain/questions/question.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { QuestionViewDto } from '../../api/view-dto/question-view-dto';
import { QuestionsQueryDto } from '../../api/input-dto/questions/questions-query-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { QuestionsPublishedStatuses } from '../../api/input-dto/questions/questions-published-statuses';

@Injectable()
export class QuestionsQueryRepository {
  constructor(
    @InjectRepository(Question) private questions: Repository<Question>,
  ) {}

  async findQuestionById(id: number): Promise<QuestionViewDto> {
    const question = await this.questions
      .createQueryBuilder('q')
      .select([
        'q.id as id',
        'q.body as body',
        'q."correctAnswers" as "correctAnswers"',
        'q."isPublished" as "isPublished"',
        'q."createdAt" as "createdAt"',
        'q."updatedAt" as "updatedAt"',
      ])
      .where({id: id})
      .getRawOne<QuestionDBRaw>()

    if (!question) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Question not found',
        field: 'id',
      });
    }
    return QuestionViewDto.mapToView(question);
  }
  async findQuestions(query: QuestionsQueryDto) {
    const whereOptions: FindOptionsWhere<Question>[] = [];
    if (query.bodySearchTerm) {
      whereOptions.push({ body: ILike(`%${query.bodySearchTerm}%`) });
    }
    switch (query.publishedStatus){
      case QuestionsPublishedStatuses.published:
        whereOptions.push({ isPublished: true })
        break;
      case QuestionsPublishedStatuses.notPublished:
        whereOptions.push({ isPublished: false })
    }
    const items = await this.questions
      .createQueryBuilder('q')
      .select([
        'q.id as id',
        'q.body as body',
        'q."correctAnswers" as "correctAnswers"',
        'q."isPublished" as "isPublished"',
        'q."createdAt" as "createdAt"',
        'q."updatedAt" as "updatedAt"',
      ])
      .where(whereOptions)
      .orderBy(
        `"${query.sortBy}"`,
        `${query.sortDirection.toUpperCase()}` as 'ASC' | 'DESC',
      )
      .offset(query.calculateSkip())
      .limit(query.pageSize)
      .getRawMany<QuestionDBRaw>();

    const totalCount = await this.questions
      .createQueryBuilder('q')
      .where(whereOptions)
      .getCount();

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
      items: items.map(QuestionViewDto.mapToView),
    });
  }
}
export class QuestionDBRaw {
  id: number;
  body: string;
  correctAnswers: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
