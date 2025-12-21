import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../infrastructure/questions/questions.repository';
import { UpdateQuestionInputDto } from '../../api/input-dto/questions/update-question-input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class UpdateQuestionCommand {
  constructor(
    public dto: UpdateQuestionInputDto,
    public questionId: number,
  ) {}
}
@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand, void>
{
  constructor(private questionsRepository: QuestionsRepository) {}
  async execute(command: UpdateQuestionCommand): Promise<void> {
    const foundQuestion = await this.questionsRepository.findByIdOrFail(
      command.questionId,
    );
    if (foundQuestion.isPublished && command.dto.correctAnswers.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: "Property 'correctAnswers' not provided when answer published",
        field: "correctAnswers",
      });
    }
    const updatedQuestion = foundQuestion.updateQuestion(command.dto)
    await this.questionsRepository.save(updatedQuestion);
  }
}