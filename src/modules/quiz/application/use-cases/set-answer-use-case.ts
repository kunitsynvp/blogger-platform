import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { GamesRepository } from '../../infrastructure/games/games.repository';
import {
  NotAnsweredQuestionsDBRaw,
  QuestionsRepository,
} from '../../infrastructure/questions/questions.repository';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { AnswerInputDto } from '../../api/input-dto/games/answer-input-dto';
import { Answer } from '../../domain/answers/answers.entity';
import { AnswerStatus } from '../../domain/dto/answer-statuses';
import { CreateAnswerDomainDto } from '../../domain/dto/create-answer-domain-dto';
import { AnswersRepository } from '../../infrastructure/answers/answers.repository';
import { AnswerViewDto } from '../../api/view-dto/answer-view-dto';
import { PlayersRepository } from '../../infrastructure/players/players.repository';
import { Player } from '../../domain/players/players.entity';

export class SetAnswerCommand {
  constructor(
    public userInfo: UserContextDto,
    public dto: AnswerInputDto,
  ) {}
}

@CommandHandler(SetAnswerCommand)
export class SetAnswerUseCase
  implements ICommandHandler<SetAnswerCommand, AnswerViewDto>
{
  constructor(
    private gamesRepository: GamesRepository,
    private questionsRepository: QuestionsRepository,
    private answersRepository: AnswersRepository,
    private playersRepository: PlayersRepository,
  ) {}

  async execute(command: SetAnswerCommand): Promise<AnswerViewDto> {
    const foundActiveGame = await this.gamesRepository.findActiveGameForUser(
      command.userInfo.userId,
    );
    if (!foundActiveGame) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Active game for current user not exist',
        field: 'None',
      });
    }
    const currentPlayer =
      await this.playersRepository.getPlayerByUserIdAndGameId(
        command.userInfo.userId,
        foundActiveGame.id,
      );
    const notAnsweredQuestions =
      await this.questionsRepository.getNotAnsweredQuestionsForUserAndGame(
        command.userInfo.userId,
        foundActiveGame.id,
      );
    //All questions answered
    if (notAnsweredQuestions.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'User answered to all questions for this game',
        field: 'None',
      });
    }
    const createdAnswer = await this.createAnswer(
      notAnsweredQuestions[0], //answer on first of not answered questions
      command.dto.answer,
      currentPlayer,
    );
    //if user answer last his question
    if (notAnsweredQuestions.length === 1) {
      await this.tryToFinishGame(foundActiveGame.id);
    }
    return AnswerViewDto.createViewDto(createdAnswer);
  }

  private async createAnswer(
    question: NotAnsweredQuestionsDBRaw,
    answerText: string,
    currentPlayer: Player,
  ): Promise<Answer> {

    const isAnswerCorrect = question.correctAnswers.includes(answerText);
    if (isAnswerCorrect) {
      await this.playersRepository.save(currentPlayer.addOnePointToScore());
    }
    const status = isAnswerCorrect
      ? AnswerStatus.correct
      : AnswerStatus.incorrect;

    const createdAnswer = Answer.createAnswer(
      CreateAnswerDomainDto.createDto(
        status,
        question.questionId,
        question.playerId,
      ),
    );
    return await this.answersRepository.save(createdAnswer);
  }
  private async tryToFinishGame(gameId: string) {
    const foundGame = await this.gamesRepository.findGameById(gameId);
    if (!foundGame) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Game not found',
        field: 'None',
      });
    }
    const areAllQuestionsAnswered =
      await this.checkIfAllQuestionsAnsweredForGame(foundGame.id);
    if (areAllQuestionsAnswered) {
      await this.calculateExtraScore(foundGame.id);
      await this.gamesRepository.saveInDb(foundGame.finishGame());
    }
  }
  private async checkIfAllQuestionsAnsweredForGame(gameId: string) {
    const countOfNotAnsweredQuestions =
      await this.questionsRepository.getCountOfNotAnsweredQuestionsForGame(
        gameId,
      );
    return !countOfNotAnsweredQuestions;
  }
  private async calculateExtraScore(gameId: string) {
    const getPlayersResult =
      await this.playersRepository.findPlayersResultForGame(gameId);
    const [player1Result, player2Result] = getPlayersResult;
    if (
      player1Result.lastAnswer < player2Result.lastAnswer &&
      player1Result.score > 0
    ) {
      const player = await this.playersRepository.findPlayerById(
        player1Result.playerId,
      );
      await this.playersRepository.save(player.addOnePointToScore());
      return;
    } else if (
      player2Result.lastAnswer < player1Result.lastAnswer &&
      player2Result.score > 0
    ) {
      const player = await this.playersRepository.findPlayerById(
        player2Result.playerId,
      );
      await this.playersRepository.save(player.addOnePointToScore());
    }
  }
}