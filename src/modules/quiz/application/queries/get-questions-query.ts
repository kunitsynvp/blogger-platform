import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuestionsQueryDto } from '../../api/input-dto/questions-query-dto';
import { QuestionsQueryRepository } from '../../infrastructure/questions.query.repository';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { QuestionViewDto } from '../../api/view-dto/question-view-dto';

export class GetQuestionsQuery {
  constructor(public query: QuestionsQueryDto) {}
}
@QueryHandler(GetQuestionsQuery)
export class GetQuestionsQueryHandler implements IQueryHandler<GetQuestionsQuery, PaginatedViewDto<QuestionViewDto[]>> {
  constructor(private questionsQueryRepository: QuestionsQueryRepository) {
  }
  async execute(query: GetQuestionsQuery): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    return await this.questionsQueryRepository.findQuestions(query.query)
  }
}