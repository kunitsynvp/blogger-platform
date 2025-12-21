import { QuestionDBRaw } from '../../infrastructure/questions/questions.query.repository';

export class QuestionViewDto {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;

  static mapToView(question: QuestionDBRaw): QuestionViewDto {
    const dto = new QuestionViewDto();

    dto.id = question.id.toString()
    dto.body = question.body
    dto.correctAnswers = question.correctAnswers
    dto.published = question.isPublished
    dto.createdAt = question.createdAt.toISOString()
    dto.updatedAt = question.updatedAt ? question.updatedAt.toISOString() : question.updatedAt

    return dto
  }

}