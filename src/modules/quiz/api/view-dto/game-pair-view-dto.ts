import { GamePlayerProgressViewDto } from './game-player-progress-view-dto';
import { GameStatus } from '../../domain/dto/game-statuses';
import { QuestionsPartialViewDto } from './question-partial-view-dto';
import {
  GameDBRaw,
  PlayerProgressDBRaw,
  QuestionDbRaw,
} from '../../infrastructure/games/games.query.repository';
import { AnswerViewDto } from './answer-view-dto';

export class GamePairViewDto {
  id: string;
  firstPlayerProgress: GamePlayerProgressViewDto;
  secondPlayerProgress: GamePlayerProgressViewDto | null;
  questions: QuestionsPartialViewDto[] | null;
  status: GameStatus;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;

  static mapToView(game: GameDBRaw,
                   playersProgress:PlayerProgressDBRaw[][],
                   questions: QuestionDbRaw[]) {
    const firstPlayerProgress = playersProgress[0]
    const hasGameSecondPlayer = !!playersProgress[1]
    const secondPlayerProgress = hasGameSecondPlayer ? playersProgress[1] : null;

    const viewDto = new GamePairViewDto()
    viewDto.id = game.id
    viewDto.firstPlayerProgress = {
      answers: GamePairViewDto.mapAnswers(firstPlayerProgress),
      player: {
        id: firstPlayerProgress[0].playerId.toString(),
        login: firstPlayerProgress[0].login
      },
      score: firstPlayerProgress[0].score
    }
    viewDto.secondPlayerProgress =
      !hasGameSecondPlayer
        ? null
        : {
            answers: GamePairViewDto.mapAnswers(secondPlayerProgress!),
            player: {
              id: secondPlayerProgress![0].playerId.toString(),
              login: secondPlayerProgress![0].login
            },
            score: secondPlayerProgress![0].score
        }
    viewDto.questions = hasGameSecondPlayer ? GamePairViewDto.mapQuestions(questions) : null
    viewDto.status = game.status
    viewDto.pairCreatedDate = game.pairCreatedDate
    viewDto.startGameDate = game.startGameDate
    viewDto.finishGameDate = game.finishGameDate
    console.log("gamePairView: ", viewDto);
    return viewDto
  }
  private static mapAnswers(playerProgress: PlayerProgressDBRaw[]) {
    return playerProgress
      .filter(progress => progress.answerStatus)
      .map(progress => {
        return {
          questionId: progress.questionId.toString(),
          answerStatus: progress.answerStatus,
          addedAt: progress.addedAt!.toISOString(),
        } as AnswerViewDto
    })
  }
  private static mapQuestions(questions: QuestionDbRaw[]):QuestionsPartialViewDto[] {
    return questions
      .map((question: QuestionDbRaw) => {
        return {
          id: question.id.toString(),
          body: question.body,
        }
      })
  }
}
