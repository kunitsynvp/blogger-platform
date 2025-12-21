import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { GameQuestion } from '../../domain/games-questions/games-questions.entity';

@Injectable()
export class GamesQuestionsRepository {
  constructor(
    @InjectRepository(GameQuestion)
    private gamesQuestions: Repository<GameQuestion>,
  ) {}

  async save(gameQuestion: GameQuestion): Promise<GameQuestion> {
    return await this.gamesQuestions.save(gameQuestion);
  }
}
