import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../modules/quiz/domain/games/games.entity';
import { Question } from '../modules/quiz/domain/questions/question.entity';
import { GameQuestion } from '../modules/quiz/domain/games-questions/games-questions.entity';
import { Player } from '../modules/quiz/domain/players/players.entity';
import { Answer } from '../modules/quiz/domain/answers/answers.entity';
import { GamesRepository } from '../modules/quiz/infrastructure/games/games.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Game, GameQuestion, Player, Answer]),
  ],
  exports: [],
  providers: [GamesRepository],
  controllers: [TestingController],
})
export class TestingModule {}