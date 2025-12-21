import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { QuestionViewDto } from '../../../../src/modules/quiz/api/view-dto/question-view-dto';

export class QuestionsTestManager {
  private readonly BasicAuthString: string = 'Basic YWRtaW46cXdlcnR5';

  constructor(private app: INestApplication) {}

  async createSeveralQuestions(
    amount: number,
    body: string = 'newValidBody',
    correctAnswers: string[] = ['1', '2', '3', '4'],
  ): Promise<QuestionViewDto[]> {
    const questions: QuestionViewDto[] = [];
    for (let i = 0; i < amount; i++) {
      const creationData = {
        body: `${body}` + i,
        correctAnswers: correctAnswers,
      };

      const createdQuestion = await request(this.app.getHttpServer())
        .post('/sa/quiz/questions')
        .set('Authorization', this.BasicAuthString)
        .send(creationData)
        .expect(201);

      questions.push(createdQuestion.body);
    }
    return questions;
  }
  async createFivePublishedQuestions(
    body: string = 'question № ',
    correctAnswers: string[] = ['one', 'two', 'three', 'four'],
  ): Promise<QuestionViewDto[]> {
    const questions: QuestionViewDto[] = [];
    for (let i = 0; i < 5; i++) {
      const creationData = {
        body: `${body}` + i,
        correctAnswers: correctAnswers,
      };

      const createdQuestion = await request(this.app.getHttpServer())
        .post('/sa/quiz/questions')
        .set('Authorization', this.BasicAuthString)
        .send(creationData)
        .expect(201);
      await this.changePublishStatus(createdQuestion.body.id);
      questions.push(createdQuestion.body);
    }
    return questions;
  }
  async changePublishStatus(
    questionId: number,
    newStatus: boolean = true,
  ): Promise<void> {
    await request(this.app.getHttpServer())
      .put(`/sa/quiz/questions/${questionId}/publish`)
      .set('Authorization', this.BasicAuthString)
      .send({
        published: newStatus,
      })
      .expect(204);
  }
}
