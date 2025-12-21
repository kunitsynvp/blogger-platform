import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { GamePairViewDto } from '../../../../src/modules/quiz/api/view-dto/game-pair-view-dto';
import { AnswerViewDto } from '../../../../src/modules/quiz/api/view-dto/answer-view-dto';
import { delay } from '../delay';

export class GamesTestManager {
  gamePath: string = "/pair-game-quiz/pairs"
  constructor(private app: INestApplication) {}

  async createGame(aToken1: string, aToken2: string): Promise<GamePairViewDto> {
    const res1 = await request(this.app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .set('Authorization', `Bearer ${aToken1}`)
      .expect(200);
    const res2 = await request(this.app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .set('Authorization', `Bearer ${aToken2}`)
      .expect(200);
    return res2.body;
  }
  async answerToQuestion(aToken: string, answer: string): Promise<AnswerViewDto> {
    const res = await request(this.app.getHttpServer())
      .post(this.gamePath + '/my-current/answers')
      .set('Authorization', `Bearer ${aToken}`)
      .send({
        answer: answer
      })
      .expect(200);
    return res.body
  }
  async answerToAllQuestionsFromFirst(correctCount: number = 5, aToken: string): Promise<void> {
    const correctAnswer = "one"
    const incorrectAnswer = "incorrect"
    if (correctCount <= 5) {
      for (let i = 0; i < correctCount; i++) {
        await this.answerToQuestion(aToken, correctAnswer);
        await delay(20)
      }
      for (let j = 0; j < 5 - correctCount; j++) {
        await this.answerToQuestion(aToken, incorrectAnswer);
        await delay(20)
      }
    } else {
      throw new Error('Wrong correctCount parameter');
    }

  }
  async getGameById(gameId: string, aToken: string): Promise<GamePairViewDto> {
    const res = await request(this.app.getHttpServer())
      .get(this.gamePath + `/${gameId}`)
      .set('Authorization', `Bearer ${aToken}`)
      .expect(200);
    return res.body;
  }
}
