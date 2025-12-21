import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { initSettings } from './helpers/testing-app-init';
import { deleteAllData } from './helpers/delete-all-data';
import { QuestionsTestManager } from './helpers/test-managers/questions-test-manager';

describe('Questions flow (e2e) tests', () => {
  const basicAuthString: string = 'Basic YWRtaW46cXdlcnR5';
  let app: INestApplication;
  let questionsTestManager: QuestionsTestManager;

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
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

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
  describe('GET(/sa/quiz/questions) get questions with pagination and filtering e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      questionsTestManager = result.questionsTestManager;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(200) ✅ Should return questions', async () => {
      const createdQuestions =
        await questionsTestManager.createSeveralQuestions(4);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items.length).toEqual(4);
      expect(res.body.items).toEqual(createdQuestions.reverse());
    });
    it('(200) ✅ Should return questions properly with specified pageSize', async () => {
      const createdQuestions =
        await questionsTestManager.createSeveralQuestions(4);
      createdQuestions.reverse();

      const query = {
        pageSize: 2,
      };
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .query(query)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items.length).toEqual(2);
      expect(res.body.items).toEqual([
        createdQuestions[0],
        createdQuestions[1],
      ]);
    });
    it('(400) ❌ Shouldn`t return questions properly with invalid pageSize', async () => {
      const createdQuestions =
        await questionsTestManager.createSeveralQuestions(4);
      createdQuestions.reverse();

      const query = {
        pageSize: 'someString',
      };
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .query(query)
        .set('Authorization', basicAuthString)
        .expect(400);
    });
    it('(200) ✅ Should return questions properly with specified pageSize and pageNumber', async () => {
      const createdQuestions =
        await questionsTestManager.createSeveralQuestions(4);
      createdQuestions.reverse();

      const query = {
        pageSize: 2,
        pageNumber: 2,
      };
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .query(query)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items.length).toEqual(2);
      expect(res.body.items).toEqual([
        createdQuestions[2],
        createdQuestions[3],
      ]);
    });
    it('(400) ❌ Shouldn`t return questions  with invalid pageNumber', async () => {
      const createdQuestions =
        await questionsTestManager.createSeveralQuestions(4);
      createdQuestions.reverse();

      const query = {
        pageSize: 2,
        pageNumber: true,
      };
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .query(query)
        .set('Authorization', basicAuthString)
        .expect(400);
    });
    it('(200) ✅ Should return questions properly with specified sortDirection', async () => {
      const createdQuestions =
        await questionsTestManager.createSeveralQuestions(4);
      const query = {
        sortDirection: 'asc',
      };
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .query(query)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items.length).toEqual(4);
      expect(res.body.items).toEqual(createdQuestions);
    });
    it('(200) ✅ Should return questions properly with specified sortBy and sortDirection', async () => {
      const createdQuestions =
        await questionsTestManager.createSeveralQuestions(4);
      const query = {
        sortBy: 'body',
        sortDirection: 'asc',
      };
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .query(query)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items.length).toEqual(4);
      expect(res.body.items).toEqual(createdQuestions);
    });
    it('(400) ❌ Shouldn`t return questions properly with invalid sortBy and sortDirection', async () => {
      const createdQuestions =
        await questionsTestManager.createSeveralQuestions(4);
      const query = {
        sortBy: 'someUnexistingField',
        sortDirection: 'poKaifu',
      };
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .query(query)
        .set('Authorization', basicAuthString)
        .expect(400);
    });
    it('(200) ✅ Should return questions properly with specified bodySearchTerm', async () => {
      const createdQuestions =
        await questionsTestManager.createSeveralQuestions(11);
      createdQuestions.reverse();
      const query = {
        bodySearchTerm: '0',
      };
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .query(query)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items.length).toEqual(2);
      expect(res.body.items).toEqual([
        createdQuestions[0],
        createdQuestions[10],
      ]);
    });

    it('(200) ✅ Should return questions properly with specified publishedStatus', async () => {
      const createdQuestions =
        await questionsTestManager.createSeveralQuestions(4);
      createdQuestions.reverse();
      const query = {
        publishedStatus: 'all',
      };
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .query(query)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items.length).toEqual(4);
      expect(res.body.items).toEqual(createdQuestions);
    });
    it('(200) ✅ Should return questions properly with specified publishedStatus(published)', async () => {
      const createdQuestions =
        await questionsTestManager.createSeveralQuestions(4);
      createdQuestions.reverse();
      const query = {
        publishedStatus: 'published',
      };
      await questionsTestManager.changePublishStatus(+createdQuestions[0].id);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .query(query)
        .set('Authorization', basicAuthString)
        .expect(200);

      query.publishedStatus = 'notPublished';
      const res2 = await request(app.getHttpServer())
        .get(questionPath)
        .query(query)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items.length).toEqual(1);
      expect(res.body.items[0].published).toBeTruthy();

      const [, ...rest] = createdQuestions;
      expect(res2.body.items.length).toEqual(3);
      expect(res2.body.items).toEqual(rest);
    });
    it('(400) ❌ Shouldn`t return questions properly with invalid publishedStatus', async () => {
      const createdQuestions =
        await questionsTestManager.createSeveralQuestions(4);
      createdQuestions.reverse();
      const query = {
        publishedStatus: 'invalid',
      };
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .query(query)
        .set('Authorization', basicAuthString)
        .expect(400);
    });
    it('(401) ❌ Shouldn`t return questions with invalid authorization', async () => {
      const createdQuestions =
        await questionsTestManager.createSeveralQuestions(4);
      createdQuestions.reverse();

      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', 'invalidAuthorization')
        .expect(401);
    });
  });
  describe('PUT(/sa/quiz/questions/$questionId/publish) publish/unpublish questions e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ Should publish unpublished question', async () => {
      const unpublishedQuestion =
        await questionsTestManager.createSeveralQuestions(1);
      await request(app.getHttpServer())
        .put(`${questionPath}/${unpublishedQuestion[0].id}/publish`)
        .set('Authorization', basicAuthString)
        .send({
          published: defaults.published,
        })
        .expect(204);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items[0].published).toBeTruthy();
    });
    it('(204) ✅ Should publish and then unpublish unpublished question', async () => {
      const unpublishedQuestion =
        await questionsTestManager.createSeveralQuestions(1);
      await request(app.getHttpServer())
        .put(`${questionPath}/${unpublishedQuestion[0].id}/publish`)
        .set('Authorization', basicAuthString)
        .send({
          published: defaults.published,
        })
        .expect(204);
      await request(app.getHttpServer())
        .put(`${questionPath}/${unpublishedQuestion[0].id}/publish`)
        .set('Authorization', basicAuthString)
        .send({
          published: false,
        })
        .expect(204);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);

      expect(res.body.items[0].published).toBeFalsy();
    });
    it('(400) ❌ Shouldn`t publish question with invalid published', async () => {
      const unpublishedQuestion =
        await questionsTestManager.createSeveralQuestions(1);
      await request(app.getHttpServer())
        .put(`${questionPath}/${unpublishedQuestion[0].id}/publish`)
        .set('Authorization', basicAuthString)
        .send({
          published: 'someInvalidString',
        })
        .expect(400);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);

      expect(res.body.items[0].published).toBeFalsy();
    });
    it('(400) ❌ Shouldn`t publish question with empty array of correct answers', async () => {
      const emptyCorrectAnswers = [];
      const unpublishedQuestion =
        await questionsTestManager.createSeveralQuestions(
          1,
          defaults.body,
          emptyCorrectAnswers,
        );
      await request(app.getHttpServer())
        .put(`${questionPath}/${unpublishedQuestion[0].id}/publish`)
        .set('Authorization', basicAuthString)
        .send({
          published: defaults.published,
        })
        .expect(400);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);

      expect(res.body.items[0].published).toBeFalsy();
    });
    it('(401) ❌ Shouldn`t publish question with invalid auth', async () => {
      const unpublishedQuestion =
        await questionsTestManager.createSeveralQuestions(1);
      await request(app.getHttpServer())
        .put(`${questionPath}/${unpublishedQuestion[0].id}/publish`)
        .set('Authorization', 'invalidAuth')
        .send({
          published: defaults.published,
        })
        .expect(401);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);

      expect(res.body.items[0].published).toBeFalsy();
    });
  });
  describe('PUT(/sa/quiz/questions/$questionId) update question e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ Should update question', async () => {
      const createdQuestion =
        await questionsTestManager.createSeveralQuestions(1);
      const updatedBody = 'updatedBody';
      const updatedCorrectAnswers = [
        'updatedAnswer1',
        'updatedAnswer2',
        'updatedAnswer3',
        'updatedAnswer4',
      ];
      await request(app.getHttpServer())
        .put(`${questionPath}/${createdQuestion[0].id}`)
        .set('Authorization', basicAuthString)
        .send({
          body: updatedBody,
          correctAnswers: updatedCorrectAnswers,
        })
        .expect(204);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items[0].body).toEqual(updatedBody);
      expect(res.body.items[0].correctAnswers).toEqual(updatedCorrectAnswers);
      expect(res.body.items[0].published).toBeFalsy();
      expect(res.body.items[0].id).toEqual(expect.any(String));
      expect(res.body.items[0].createdAt).toEqual(expect.any(String));
      expect(res.body.items[0].updatedAt).toEqual(expect.any(String));
    });
    it('(400) ❌ Shouldn`t update question with invalid body', async () => {
      const createdQuestion =
        await questionsTestManager.createSeveralQuestions(1);
      const invalidBody = true;
      const updatedCorrectAnswers = [
        'updatedAnswer1',
        'updatedAnswer2',
        'updatedAnswer3',
        'updatedAnswer4',
      ];
      await request(app.getHttpServer())
        .put(`${questionPath}/${createdQuestion[0].id}`)
        .set('Authorization', basicAuthString)
        .send({
          body: invalidBody,
          correctAnswers: updatedCorrectAnswers,
        })
        .expect(400);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items[0].body).toEqual(createdQuestion[0].body);
      expect(res.body.items[0].correctAnswers).toEqual(
        createdQuestion[0].correctAnswers,
      );
      expect(res.body.items[0].published).toBeFalsy();
      expect(res.body.items[0].id).toEqual(expect.any(String));
      expect(res.body.items[0].createdAt).toEqual(expect.any(String));
      expect(res.body.items[0].updatedAt).toEqual(expect.any(String));
    });
    it('(400) ❌ Shouldn`t update question with invalid correctAnswers', async () => {
      const createdQuestion =
        await questionsTestManager.createSeveralQuestions(1);
      const updatedBody = 'updatedBody';
      const invalidCorrectAnswers = [
        true,
        2,
        'updatedAnswer3',
        'updatedAnswer4',
      ];
      await request(app.getHttpServer())
        .put(`${questionPath}/${createdQuestion[0].id}`)
        .set('Authorization', basicAuthString)
        .send({
          body: updatedBody,
          correctAnswers: invalidCorrectAnswers,
        })
        .expect(400);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items[0].body).toEqual(createdQuestion[0].body);
      expect(res.body.items[0].correctAnswers).toEqual(
        createdQuestion[0].correctAnswers,
      );
      expect(res.body.items[0].published).toBeFalsy();
      expect(res.body.items[0].id).toEqual(expect.any(String));
      expect(res.body.items[0].createdAt).toEqual(expect.any(String));
      expect(res.body.items[0].updatedAt).toEqual(expect.any(String));
    });
    it('(400) ❌ Shouldn`t update question with prop "correctAnswers" not passed and "published" true', async () => {
      const updatedBody = 'updatedBody';
      const createdQuestion =
        await questionsTestManager.createSeveralQuestions(1);
      await questionsTestManager.changePublishStatus(+createdQuestion[0].id);
      await request(app.getHttpServer())
        .put(`${questionPath}/${createdQuestion[0].id}`)
        .set('Authorization', basicAuthString)
        .send({
          body: updatedBody,
        })
        .expect(400);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items[0].body).toEqual(createdQuestion[0].body);
      expect(res.body.items[0].correctAnswers).toEqual(
        createdQuestion[0].correctAnswers,
      );
      expect(res.body.items[0].published).toBeTruthy();
      expect(res.body.items[0].id).toEqual(expect.any(String));
      expect(res.body.items[0].createdAt).toEqual(expect.any(String));
      expect(res.body.items[0].updatedAt).toEqual(expect.any(String));
    });
    it('(401) ❌ Shouldn`t update question with invalid auth', async () => {
      const createdQuestion =
        await questionsTestManager.createSeveralQuestions(1);
      const updatedBody = 'updatedBody';
      const updatedCorrectAnswers = [
        'updatedAnswer1',
        'updatedAnswer2',
        'updatedAnswer3',
        'updatedAnswer4',
      ];
      await request(app.getHttpServer())
        .put(`${questionPath}/${createdQuestion[0].id}`)
        .set('Authorization', 'invalidAuth')
        .send({
          body: updatedBody,
          correctAnswers: updatedCorrectAnswers,
        })
        .expect(401);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items[0].body).toEqual(createdQuestion[0].body);
      expect(res.body.items[0].correctAnswers).toEqual(
        createdQuestion[0].correctAnswers,
      );
      expect(res.body.items[0].published).toBeFalsy();
      expect(res.body.items[0].id).toEqual(expect.any(String));
      expect(res.body.items[0].createdAt).toEqual(expect.any(String));
      expect(res.body.items[0].updatedAt).toEqual(expect.any(String));
    });
    it('(404) ❌ Shouldn`t update question with non existing id', async () => {
      const createdQuestion =
        await questionsTestManager.createSeveralQuestions(1);
      const updatedBody = 'updatedBody';
      const updatedCorrectAnswers = [
        'updatedAnswer1',
        'updatedAnswer2',
        'updatedAnswer3',
        'updatedAnswer4',
      ];
      await request(app.getHttpServer())
        .put(`${questionPath}/${createdQuestion[0].id + 1}`)
        .set('Authorization', basicAuthString)
        .send({
          body: updatedBody,
          correctAnswers: updatedCorrectAnswers,
        })
        .expect(404);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items[0].body).toEqual(createdQuestion[0].body);
      expect(res.body.items[0].correctAnswers).toEqual(
        createdQuestion[0].correctAnswers,
      );
      expect(res.body.items[0].published).toBeFalsy();
      expect(res.body.items[0].id).toEqual(expect.any(String));
      expect(res.body.items[0].createdAt).toEqual(expect.any(String));
      expect(res.body.items[0].updatedAt).toEqual(expect.any(String));
    });
    it('(404) ❌ Shouldn`t update question with invalid id', async () => {
      const createdQuestion =
        await questionsTestManager.createSeveralQuestions(1);
      const updatedBody = 'updatedBody';
      const updatedCorrectAnswers = [
        'updatedAnswer1',
        'updatedAnswer2',
        'updatedAnswer3',
        'updatedAnswer4',
      ];
      await request(app.getHttpServer())
        .put(`${questionPath}/true`)
        .set('Authorization', basicAuthString)
        .send({
          body: updatedBody,
          correctAnswers: updatedCorrectAnswers,
        })
        .expect(404);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items[0].body).toEqual(createdQuestion[0].body);
      expect(res.body.items[0].correctAnswers).toEqual(
        createdQuestion[0].correctAnswers,
      );
      expect(res.body.items[0].published).toBeFalsy();
      expect(res.body.items[0].id).toEqual(expect.any(String));
      expect(res.body.items[0].createdAt).toEqual(expect.any(String));
      expect(res.body.items[0].updatedAt).toEqual(expect.any(String));
    });
  });
  describe('DELETE(/sa/quiz/questions/$questionId) delete question e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ Should delete question', async () => {
      const createdQuestion =
        await questionsTestManager.createSeveralQuestions(1);
      await request(app.getHttpServer())
        .delete(`${questionPath}/${createdQuestion[0].id}`)
        .set('Authorization', basicAuthString)
        .expect(204);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items.length).toBe(0);
    });

    it('(401) ❌ Shouldn`t delete question with invalid auth', async () => {
      const createdQuestion =
        await questionsTestManager.createSeveralQuestions(1);
      await request(app.getHttpServer())
        .delete(`${questionPath}/${createdQuestion[0].id}`)
        .set('Authorization', 'invalidAuth')
        .expect(401);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items[0].body).toEqual(createdQuestion[0].body);
      expect(res.body.items[0].correctAnswers).toEqual(
        createdQuestion[0].correctAnswers,
      );
      expect(res.body.items[0].published).toBeFalsy();
      expect(res.body.items[0].id).toEqual(expect.any(String));
      expect(res.body.items[0].createdAt).toEqual(expect.any(String));
      expect(res.body.items[0].updatedAt).toEqual(expect.any(String));
    });
    it('(404) ❌ Shouldn`t delete question with non existing uri id', async () => {
      const createdQuestion =
        await questionsTestManager.createSeveralQuestions(1);

      await request(app.getHttpServer())
        .delete(`${questionPath}/${createdQuestion[0].id + 1}`)
        .set('Authorization', basicAuthString)
        .expect(404);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items[0].body).toEqual(createdQuestion[0].body);
      expect(res.body.items[0].correctAnswers).toEqual(
        createdQuestion[0].correctAnswers,
      );
      expect(res.body.items[0].published).toBeFalsy();
      expect(res.body.items[0].id).toEqual(expect.any(String));
      expect(res.body.items[0].createdAt).toEqual(expect.any(String));
      expect(res.body.items[0].updatedAt).toEqual(expect.any(String));
    });
    it('(404) ❌ Shouldn`t delete question with invalid uri id', async () => {
      const createdQuestion =
        await questionsTestManager.createSeveralQuestions(1);

      await request(app.getHttpServer())
        .delete(`${questionPath}/false`)
        .set('Authorization', basicAuthString)
        .expect(404);
      const res = await request(app.getHttpServer())
        .get(questionPath)
        .set('Authorization', basicAuthString)
        .expect(200);
      expect(res.body.items[0].body).toEqual(createdQuestion[0].body);
      expect(res.body.items[0].correctAnswers).toEqual(
        createdQuestion[0].correctAnswers,
      );
      expect(res.body.items[0].published).toBeFalsy();
      expect(res.body.items[0].id).toEqual(expect.any(String));
      expect(res.body.items[0].createdAt).toEqual(expect.any(String));
      expect(res.body.items[0].updatedAt).toEqual(expect.any(String));
    });
  });
});