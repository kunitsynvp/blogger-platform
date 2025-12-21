import { Module } from '@nestjs/common';
import { QuestionsController } from './api/questions/questions.controller';
import { QuestionsRepository } from './infrastructure/questions/questions.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './domain/questions/question.entity';
import { GetQuestionByIdQueryHandler } from './application/queries/get-question-query';
import { GetQuestionsQueryHandler } from './application/queries/get-questions-query';
import { QuestionsQueryRepository } from './infrastructure/questions/questions.query.repository';
import { CreateQuestionUseCase } from './application/use-cases/create-question-use-case';
import { ChangePublishStatusUseCase } from './application/use-cases/change-publish-status-use-case';
import { UpdateQuestionUseCase } from './application/use-cases/update-question-use-case';
import { DeleteQuestionUseCase } from './application/use-cases/delete-question-use-case';
import { GamesController } from './api/games/games.controller';
import { GetGameByIdQueryHandler } from './application/queries/get-game-by-id-query';
import { ConnectToGameUseCase } from './application/use-cases/connect-to-game-use-case';
import { GamesQuestionsRepository } from './infrastructure/game-questions/games-questions.repository';
import { GamesQueryRepository } from './infrastructure/games/games.query.repository';
import { GamesRepository } from './infrastructure/games/games.repository';
import { PlayersRepository } from './infrastructure/players/players.repository';
import { GameQuestion } from './domain/games-questions/games-questions.entity';
import { Game } from './domain/games/games.entity';
import { Player } from './domain/players/players.entity';
import { Answer } from './domain/answers/answers.entity';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import {
  ACCESS_TOKEN_INJECT_TOKEN,
  REFRESH_TOKEN_INJECT_TOKEN,
} from '../user-accounts/constants/jwt-tokens-inject-constants';
import { JwtService } from '@nestjs/jwt';
import { QuizConfig } from './config/quiz-config';
import { SetAnswerUseCase } from './application/use-cases/set-answer-use-case';
import { AnswersRepository } from './infrastructure/answers/answers.repository';
import { GetActiveGameForUserQueryHandler } from './application/queries/get-active-game-for-user-query';
import { ExtractReposForTransactions } from '../../core/helpers/extractRepositoriesForTransactions';

const queryHandlers = [
  GetQuestionByIdQueryHandler,
  GetQuestionsQueryHandler,
  GetGameByIdQueryHandler,
  GetActiveGameForUserQueryHandler,
];
const useCases = [
  CreateQuestionUseCase,
  ChangePublishStatusUseCase,
  UpdateQuestionUseCase,
  DeleteQuestionUseCase,
  ConnectToGameUseCase,
  SetAnswerUseCase,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Game, GameQuestion, Player, Answer]),
    UserAccountsModule,
  ],
  providers: [
    ...useCases,
    ...queryHandlers,
    QuestionsRepository,
    QuestionsQueryRepository,
    GamesQuestionsRepository,
    GamesQueryRepository,
    AnswersRepository,
    QuizConfig,
    PlayersRepository,
    GamesRepository,
    {
      provide: ACCESS_TOKEN_INJECT_TOKEN,
      useFactory: (config: QuizConfig): JwtService => {
        return new JwtService({
          secret: config.accessTokenSecret,
          signOptions: { expiresIn: config.accessTokenExpireIn },
        });
      },
      inject: [QuizConfig],
    },
    {
      provide: REFRESH_TOKEN_INJECT_TOKEN,
      useFactory: (config: QuizConfig): JwtService => {
        return new JwtService({
          secret: config.refreshTokenSecret,
          signOptions: { expiresIn: config.refreshTokenExpireIn },
        });
      },
      inject: [QuizConfig],
    },
    // {
    //   provide: GamesRepository,
    //   useFactory: createGamesRepository,
    //   inject: [getDataSourceToken()]
    // },
    ExtractReposForTransactions,
  ],
  controllers: [QuestionsController, GamesController],
  exports: [],
})
export class QuizModule {}
