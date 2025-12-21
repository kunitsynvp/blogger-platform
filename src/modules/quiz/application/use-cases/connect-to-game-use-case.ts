import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { Game } from '../../domain/games/games.entity';
import { Player } from '../../domain/players/players.entity';
import { GamesRepository } from '../../infrastructure/games/games.repository';
import { PlayersRepository } from '../../infrastructure/players/players.repository';
import { QuestionsRepository } from '../../infrastructure/questions/questions.repository';
import { GameQuestion } from '../../domain/games-questions/games-questions.entity';
import { GamesQuestionsRepository } from '../../infrastructure/game-questions/games-questions.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class ConnectToGameCommand {
  constructor(public userInfo: UserContextDto) {}
}
@CommandHandler(ConnectToGameCommand)
export class ConnectToGameUseCase
  implements ICommandHandler<ConnectToGameCommand, string>
{
  constructor(
    private gamesRepository: GamesRepository,
    private playersRepository: PlayersRepository,
    private questionsRepository: QuestionsRepository,
    private gamesQuestionsRepository: GamesQuestionsRepository,
  ) {}
  async execute(command: ConnectToGameCommand): Promise<string> {
    //TODO: check if user is participant in active game -> throw 403
    const IsUserHasActiveOrPendingGame =
      await this.playersRepository.checkHasPlayerActiveOrPendingGame(
        command.userInfo.userId,
      );
    if (IsUserHasActiveOrPendingGame) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'This user already in active game',
        field: 'None',
      });
    }
    //TODO: do logic Is pending game exist -> if not, create game -> else connect to existing game
    const foundPendingGame = await this.gamesRepository.findPendingGame();
    if (!foundPendingGame) {
      const createdGame = Game.createGame();
      const game = await this.gamesRepository.saveInDb(createdGame);
      const createdFirstPlayer = Player.createPlayer(
        command.userInfo.userId,
        game.id,
      );
      const firstPlayer = await this.playersRepository.save(createdFirstPlayer);
      //setting 5 random questions to game
      const questions = await this.setFiveRandomQuestions(createdGame.id);
      return createdGame.id;
    } else {
      //if game exist -> create second player
      const createdSecondPlayer = Player.createPlayer(
        command.userInfo.userId,
        foundPendingGame.id,
      );
      //save second player
      const secondPlayer =
        await this.playersRepository.save(createdSecondPlayer);

      //starting game
      const startedGame = foundPendingGame.startGame();
      await this.gamesRepository.saveInDb(startedGame);
      return startedGame.id;
    }
  }

  private async setFiveRandomQuestions(gameId: string): Promise<void> {
    const randomQuestionsIds =
      await this.questionsRepository.findFiveRandomPublishedQuestions();
    for (let i = 0; i < 5; i++) {
      const newGameQuestion = GameQuestion.create(
        gameId,
        randomQuestionsIds[i],
      );
      await this.gamesQuestionsRepository.save(newGameQuestion);
    }
  }
}