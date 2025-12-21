import { QuestionDBRaw } from '../../infrastructure/questions/questions.query.repository';

export class QuestionsPartialViewDto  {
  id: string;
  body: string;

  static mapToView(question: QuestionDBRaw): QuestionsPartialViewDto {
    const dto = new QuestionsPartialViewDto();
    dto.id = question.id.toString()
    dto.body = question.body
    return dto
  }

}