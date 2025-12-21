import { AnswerStatus } from './answer-statuses';

export class CreateAnswerDomainDto {
  status: AnswerStatus;
  questionId: number;
  playerId: number;
  static createDto(status: AnswerStatus, questionId: number, playerId: number) {
    const dto = new CreateAnswerDomainDto()
    dto.status = status;
    dto.questionId = questionId;
    dto.playerId = playerId;
    return dto
  }
}