import { Module } from '@nestjs/common';
import { QuestionsController } from './api/questions/questions.controller';
import { QuestionsRepository } from './infrastructure/questions.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/questions/question.entity';
import { GetQuestionByIdQueryHandler } from './application/queries/get-question-query';
import {
  GetQuestionsQueryHandler,
} from './application/queries/get-questions-query';
import { QuestionsQueryRepository } from './infrastructure/questions.query.repository';
import { CreateQuestionUseCase } from './application/use-cases/create-question-use-case';

const queryHandlers = [
  GetQuestionByIdQueryHandler,
  GetQuestionsQueryHandler
]
const useCases = [
  CreateQuestionUseCase
]
@Module({
  imports: [
    TypeOrmModule.forFeature([Question])
  ],
  providers: [
    ...useCases,
    ...queryHandlers,
    QuestionsRepository,
    QuestionsQueryRepository
  ],
  controllers: [QuestionsController],
  exports: [],
})
export class QuizModule {}
