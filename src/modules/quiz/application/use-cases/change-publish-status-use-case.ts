import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions/questions.repository';
import { PublishQuestionDto } from '../../api/input-dto/questions/publish-question-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class ChangePublishStatusCommand {
  constructor(
    public questionId: number,
    public dto: PublishQuestionDto,
  ) {}
}
@CommandHandler(ChangePublishStatusCommand)
export class ChangePublishStatusUseCase
  implements ICommandHandler<ChangePublishStatusCommand, void>
{
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute(command: ChangePublishStatusCommand): Promise<void> {
    const foundQuestion = await this.questionsRepository.findByIdOrFail(
      command.questionId,
    );
    if (foundQuestion.correctAnswers.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "This question doesn`t have correct answers",
        field: "correctAnswers",
      });
    }
    const updatedQuestion = foundQuestion.changePublishStatus(command.dto.published)
    await this.questionsRepository.save(updatedQuestion);
  }
}