import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuestionViewDto } from '../../api/view-dto/question-view-dto';
import { QuestionsQueryRepository } from '../../infrastructure/questions.query.repository';

export class GetQuestionByIdQuery {
  constructor(public id: number) {}
}
@QueryHandler(GetQuestionByIdQuery)
export class GetQuestionByIdQueryHandler implements IQueryHandler<GetQuestionByIdQuery, QuestionViewDto> {
  constructor(private questionsQueryRepository: QuestionsQueryRepository) {
  }
  async execute(query: GetQuestionByIdQuery): Promise<QuestionViewDto> {
    return await this.questionsQueryRepository.findQuestionById(query.id)
  }
}