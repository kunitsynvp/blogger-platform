import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { GamePairViewDto } from '../../api/view-dto/game-pair-view-dto';
import { Game } from '../../domain/games/games.entity';
import { AnswerStatus } from '../../domain/dto/answer-statuses';
import { GameStatus } from '../../domain/dto/game-statuses';
import { Player } from '../../domain/players/players.entity';
import { Question } from '../../domain/questions/question.entity';

@Injectable()
export class GamesQueryRepository {
  constructor(@InjectRepository(Game) private games: Repository<Game>,
              @InjectRepository(Player) private players: Repository<Player>,
              @InjectRepository(Question) private questions: Repository<Question>, ) {}

  async findGameByIdAndUserId(gameId: string, userId: number): Promise<GamePairViewDto> {
    const game  = await this.games
      .createQueryBuilder('g')
      .select('g.id as "gameId"')
      .innerJoin('g.players', 'p')
      .where('p."userId" = :userId', { userId: userId })
      .getRawOne<{ gameId: string }>();
    if (!game) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Not access to game for another user',
        field: 'None',
      });
    }
    const [foundGame, playersProgress, questions] = await Promise.all([
      this.getGame(gameId),
      this.getPlayersProgress(gameId),
      this.getQuestions(gameId),
    ]);

    if (!foundGame) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Game not found',
        field: 'id',
      });
    }
    return GamePairViewDto.mapToView(foundGame, playersProgress, questions);
  }
  async findActiveGameByUserId(userId: number): Promise<GamePairViewDto> {
    const gameId  = await this.games
      .createQueryBuilder('g')
      .select('g.id as "gameId"')
      .innerJoin('g.players', 'p')
      .where('p."userId" = :userId', { userId: userId })
      .andWhere('g.status IN (:...gameStatuses)', {
        gameStatuses: [GameStatus.active, GameStatus.pending],
      })
      .getRawOne<{ gameId: string }>();
    if (!gameId) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'No active pair for current user',
        field: 'None',
      });
    }
    const [foundGame, playersProgress, questions] = await Promise.all([
      this.getGame(gameId.gameId),
      this.getPlayersProgress(gameId.gameId),
      this.getQuestions(gameId.gameId),
    ]);

    return GamePairViewDto.mapToView(foundGame!, playersProgress, questions);
  }
  private async getGame(gameId: string) {
    return await this.games
      .createQueryBuilder('g')
      .select([
        'g.id as id',
        'g.status as status',
        'g."pairCreatedDate" as "pairCreatedDate"',
        'g."startGameDate" as "startGameDate"',
        'g."finishGameDate" as "finishGameDate"',
      ])
      .where('g.id = :gameId', { gameId: gameId })
      .getRawOne<GameDBRaw>();
  }
  private async getPlayerProgress(playerId: number) {
    return await this.players
      .createQueryBuilder('p')
      .select([
        'q.id as "questionId"',
        'a.status as "answerStatus"',
        'a."addedAt" as "addedAt"',
        'u.id as "playerId"',
        'u.login as "login"',
        'p.score as score',
      ])
      .innerJoin('p.game', 'g')
      .innerJoin('g.gameQuestions', 'gq')
      .innerJoin('gq.question', 'q')
      .innerJoin('p.user', 'u')
      .leftJoin('p.answers', 'a', 'a."questionId" = q.id')
      .where('p.id = :playerId', { playerId: playerId })
      .orderBy('a."addedAt"', 'ASC')
      .getRawMany<PlayerProgressDBRaw>();
  }
  private async getPlayersProgress(gameId: string) {
    const foundPlayersIds = await this.players
      .createQueryBuilder('p')
      .select('p.id as id')
      .where('p."gameId" = :gameId', { gameId: gameId })
      .orderBy('p."createdAt"', 'ASC')
      .getRawMany<{ id: number }>();
    console.log("found players ids: ", foundPlayersIds);
    console.log("gameId ",gameId);
    const playersProgresses: PlayerProgressDBRaw[][] = [];


    for (const player of foundPlayersIds) {
      const playerProgress = await this.getPlayerProgress(player.id);
      playersProgresses.push(playerProgress);
    }
    return playersProgresses;
  }
  private async getQuestions(gameId: string) {
    const res =  await this.questions
      .createQueryBuilder('q')
      .select(['q.id as id', 'q.body as body'])
      .innerJoin('q.gameQuestions', 'gq')
      .innerJoin('gq.game', 'g')
      .where('g.id = :gameId', { gameId: gameId })
      .orderBy('gq.id', 'ASC')
      .getRawMany<QuestionDbRaw>();
    console.log("getQuestionsQuery: ", res);
    return res
  }
}

export class GameDBRaw {
  id: string;
  status: GameStatus;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
}
export class PlayerProgressDBRaw {
  questionId: number;
  answerStatus: AnswerStatus | null;
  addedAt: Date | null;
  playerId: number;
  login: string;
  score: number;
}
export class QuestionDbRaw {
  id : number;
  body: string;
}
