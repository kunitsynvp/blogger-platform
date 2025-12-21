import { INestApplication } from '@nestjs/common';
import { QuestionsTestManager } from '../e2e/helpers/test-managers/questions-test-manager';
import { initSettings } from '../e2e/helpers/testing-app-init';
import request from 'supertest';

describe('Questions flow (e2e) tests', () => {
  const basicAuthString: string = 'Basic YWRtaW46cXdlcnR5';
  let app: INestApplication;
  let questionsTestManager: QuestionsTestManager;
  let createAnswerUseCase;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
  });
  afterAll(async () => {
    await app.close();
  });
  const questionPath = `/sa/quiz/questions`;
  const defaults = {
    body: 'defaultBody',
    correctAnswers: [
      'correctAnswer1',
      'correctAnswer2',
      'correctAnswer3',
      'correctAnswer4',
    ],
    published: true,
  };

  describe('POST(/sa/quiz/questions) create questions e2e tests', () => {
    it('(201) ✅ Should create question', async () => {
      const res = await request(app.getHttpServer())
        .post(questionPath)
        .set('Authorization', basicAuthString)
        .send({
          body: defaults.body,
          correctAnswers: defaults.correctAnswers,
        })
        .expect(201);
      expect(res.body.body).toEqual(defaults.body);
      expect(res.body.correctAnswers).toEqual(defaults.correctAnswers);
      expect(res.body.published).toBeFalsy();
      expect(res.body.id).toEqual(expect.any(String));
      expect(res.body.createdAt).toEqual(expect.any(String));
      expect(res.body.updatedAt).toEqual(expect.any(String));
    });
    it('(201) ✅ Should create question with empty correct answers', async () => {
      const res = await request(app.getHttpServer())
        .post(questionPath)
        .set('Authorization', basicAuthString)
        .send({
          body: defaults.body,
          correctAnswers: [],
        })
        .expect(201);
      expect(res.body.body).toEqual(defaults.body);
      expect(res.body.correctAnswers).toEqual([]);
      expect(res.body.published).toBeFalsy();
      expect(res.body.id).toEqual(expect.any(String));
      expect(res.body.createdAt).toEqual(expect.any(String));
      expect(res.body.updatedAt).toEqual(expect.any(String));
    });
    it('(201) ✅ Should create question with no provided correct answers', async () => {
      const res = await request(app.getHttpServer())
        .post(questionPath)
        .set('Authorization', basicAuthString)
        .send({
          body: defaults.body,
        })
        .expect(201);
      expect(res.body.body).toEqual(defaults.body);
      expect(res.body.correctAnswers).toEqual([]);
      expect(res.body.published).toBeFalsy();
      expect(res.body.id).toEqual(expect.any(String));
      expect(res.body.createdAt).toEqual(expect.any(String));
      expect(res.body.updatedAt).toEqual(expect.any(String));
    });
    it('(400) ❌ Shouldn`t create question with invalid body(length less than 10)', async () => {
      const res = await request(app.getHttpServer())
        .post(questionPath)
        .set('Authorization', basicAuthString)
        .send({
          body: 'invalid',
          correctAnswers: defaults.correctAnswers,
        })
        .expect(400);
    });
    it('(400) ❌ Shouldn`t create question with invalid body(type boolean)', async () => {
      const res = await request(app.getHttpServer())
        .post(questionPath)
        .set('Authorization', basicAuthString)
        .send({
          body: true,
          correctAnswers: defaults.correctAnswers,
        })
        .expect(400);
    });
    it('(400) ❌ Shouldn`t create question with invalid correct answers(mixed types of nested elements - not strings)', async () => {
      const res = await request(app.getHttpServer())
        .post(questionPath)
        .set('Authorization', basicAuthString)
        .send({
          body: defaults.body,
          correctAnswers: [1, true, 'three'],
        })
        .expect(400);
    });
    it('(401) ❌ Shouldn`t create question with invalid auth', async () => {
      const res = await request(app.getHttpServer())
        .post(questionPath)
        .set('Authorization', 'someInvalidAuth')
        .send({
          body: defaults.body,
          correctAnswers: defaults.correctAnswers,
        })
        .expect(401);
    });
  });
});