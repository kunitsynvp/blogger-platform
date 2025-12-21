import { Answer } from '../../domain/answers/answers.entity';

export class AnswerViewDto {
  questionId: string;
  answerStatus: string;
  addedAt: string;

  static createViewDto(answer: Answer): AnswerViewDto {
    const dto = new AnswerViewDto();
    dto.answerStatus = answer.status;
    dto.questionId = answer.questionId.toString();
    dto.addedAt = answer.addedAt.toISOString();
    return dto;
  }
}