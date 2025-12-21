import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions/questions.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class DeleteQuestionCommand {
  constructor(public questionId: number) {}
}
@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand, void>
{
  constructor(private questionsRepository: QuestionsRepository) {}
  async execute(command: DeleteQuestionCommand): Promise<void> {
    const foundQuestion = await this.questionsRepository.findByIdOrFail(
      command.questionId,
    );
    if (foundQuestion.isPublished) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: "You can`t delete published question",
        field: "published",
      });
    }

    await this.questionsRepository.deleteQuestion(foundQuestion.id);
  }
}