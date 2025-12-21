import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateQuestionInputDto } from '../../api/input-dto/questions/create-question-input-dto';
import { Question } from '../../domain/questions/question.entity';
import { QuestionsRepository } from '../../infrastructure/questions/questions.repository';

export class CreateQuestionCommand {
  constructor(public dto: CreateQuestionInputDto) {}
}
@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase implements ICommandHandler
    <CreateQuestionCommand,
    number>
{
  constructor(private questionsRepository: QuestionsRepository) {
  }
  async execute(command: CreateQuestionCommand): Promise<number> {
    const newQuestion = Question.createQuestion(command.dto)
    const createdQuestion = await this.questionsRepository.save(newQuestion);
    return createdQuestion.id
  }
}