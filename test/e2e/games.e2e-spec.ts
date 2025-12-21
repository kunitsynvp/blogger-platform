import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersTestManager } from './helpers/test-managers/users-test-manager';
import { initSettings } from './helpers/testing-app-init';
import { deleteAllData } from './helpers/delete-all-data';
import { QuestionsTestManager } from './helpers/test-managers/questions-test-manager';
import { GamePairViewDto } from '../../src/modules/quiz/api/view-dto/game-pair-view-dto';
import { GameStatus } from '../../src/modules/quiz/domain/dto/game-statuses';
import { GamesTestManager } from './helpers/test-managers/games-test-manager';
import { AnswerViewDto } from '../../src/modules/quiz/api/view-dto/answer-view-dto';
import { AnswerStatus } from '../../src/modules/quiz/domain/dto/answer-statuses';

describe('Games flow (e2e) tests', () => {
  const basicAuthString: string = "Basic YWRtaW46cXdlcnR5"
  let app: INestApplication;
  let questionsTestManager: QuestionsTestManager;
  let userTestManager: UsersTestManager;
  let gamesTestManager: GamesTestManager;

  afterAll(async () => {
    await app.close();
  });
  const gamePath = `/pair-game-quiz/pairs`
  const defaults = {
    correctAnswer: "one",
    incorrectAnswer: "incorrect",

  };

  describe('POST(/pair-game-quiz/pairs/connection) connection to game e2e tests', () => {
    beforeAll(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManager = result.userTestManger
      questionsTestManager = result.questionsTestManager
    });
    beforeEach(async () => {
      await deleteAllData(app);
    });

    it('(200) ✅ Should connect to game 2 players', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()

      const res1 = await request(app.getHttpServer())
        .post(gamePath + '/connection')
        .set('Authorization', `Bearer ${firstPlayerToken}`)
        .expect(200);
      const response: GamePairViewDto = res1.body
      expect(response.id).toEqual(expect.any(String))
      expect(response.firstPlayerProgress.answers).toEqual([]);
      expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
      expect(response.firstPlayerProgress.player.login).toEqual(users[0].login);
      expect(response.firstPlayerProgress.score).toEqual(0);
      expect(response.secondPlayerProgress).toBeNull();
      expect(response.questions).toBeNull();
      expect(response.status).toEqual(GameStatus.pending);
      expect(response.pairCreatedDate).toEqual(expect.any(String));
      expect(response.startGameDate).toBeNull()
      expect(response.finishGameDate).toBeNull()

      const res2 = await request(app.getHttpServer())
        .post(gamePath + '/connection')
        .set('Authorization', `Bearer ${secondPlayerToken}`)
        .expect(200);
      const response2: GamePairViewDto = res2.body
      expect(response2.id).toEqual(expect.any(String))
      expect(response2.firstPlayerProgress.answers).toEqual([]);
      expect(response2.firstPlayerProgress.player.id).toEqual(expect.any(String));
      expect(response2.firstPlayerProgress.player.login).toEqual(users[0].login);
      expect(response2.firstPlayerProgress.score).toEqual(0);
      expect(response2.secondPlayerProgress!.answers).toEqual([]);
      expect(response2.secondPlayerProgress!.player.id).toEqual(expect.any(String));
      expect(response2.secondPlayerProgress!.player.login).toEqual(users[1].login);
      expect(response2.secondPlayerProgress!.score).toEqual(0);
      expect(response2.questions?.length).toBe(5)
      expect(response2.status).toEqual(GameStatus.active);
      expect(response2.pairCreatedDate).toEqual(expect.any(String));
      expect(response2.startGameDate).toEqual(expect.any(String));
      expect(response2.finishGameDate).toBeNull()
    });

    it('(403) ❌ Shouldn`t connect to if user has another active game', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()

      const res1 = await request(app.getHttpServer())
        .post(gamePath + '/connection')
        .set('Authorization', `Bearer ${firstPlayerToken}`)
        .expect(200);
      const res2 = await request(app.getHttpServer())
        .post(gamePath + '/connection')
        .set('Authorization', `Bearer ${firstPlayerToken}`)
        .expect(403);
    });


    it('(401) ❌ Shouldn`t connect to game with invalid auth', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()

      const res1 = await request(app.getHttpServer())
        .post(gamePath + '/connection')
        .set('Authorization', `Bearer invalidAuth`)
        .expect(401);
    });
  })
  describe('POST(/pair-game-quiz/pairs/my-current/answers) send answer to next not answered question e2e tests', () => {
    beforeAll(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManager = result.userTestManger
      questionsTestManager = result.questionsTestManager
      gamesTestManager = result.gamesTestManager
    });
    beforeEach(async () => {
      await deleteAllData(app);
    });

    it('(200) ✅ Should correct answer to 1 question', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);

      const res1 = await request(app.getHttpServer())
        .post(gamePath + '/my-current/answers')
        .set('Authorization', `Bearer ${firstPlayerToken}`)
        .send({
          answer: defaults.correctAnswer
        })
        .expect(200);
      const response: AnswerViewDto = res1.body
      expect(response.questionId).toEqual(expect.any(String))
      expect(response.answerStatus).toEqual(AnswerStatus.correct);
      expect(response.addedAt).toEqual(expect.any(String));

    });
    it('(200) ✅ Should incorrect answer to 1 question', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);

      const res1 = await request(app.getHttpServer())
        .post(gamePath + '/my-current/answers')
        .set('Authorization', `Bearer ${firstPlayerToken}`)
        .send({
          answer: defaults.incorrectAnswer
        })
        .expect(200);
      const response: AnswerViewDto = res1.body
      expect(response.questionId).toEqual(expect.any(String))
      expect(response.answerStatus).toEqual(AnswerStatus.incorrect);
      expect(response.addedAt).toEqual(expect.any(String));

    });

    it('(403) ❌ Shouldn`t answer to question if user has another active game', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(3);
      const [firstPlayerToken, secondPlayerToken,thirdPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);

      const res1 = await request(app.getHttpServer())
        .post(gamePath + '/my-current/answers')
        .set('Authorization', `Bearer ${thirdPlayerToken}`)
        .send({
          answer: defaults.incorrectAnswer
        })
        .expect(403);

    });
    it('(403) ❌ Shouldn`t answer to question if user has already answered for all questions', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(3);
      const [firstPlayerToken, secondPlayerToken,thirdPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);

      await gamesTestManager.answerToAllQuestionsFromFirst(5,firstPlayerToken)
      const res1 = await request(app.getHttpServer())
        .post(gamePath + '/my-current/answers')
        .set('Authorization', `Bearer ${firstPlayerToken}`)
        .send({
          answer: defaults.incorrectAnswer
        })
        .expect(403);

    });

    it('(401) ❌ Shouldn`t connect to game with invalid auth', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(3);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);

      const res1 = await request(app.getHttpServer())
        .post(gamePath + '/my-current/answers')
        .set('Authorization', `Bearer invalidToken`)
        .send({
          answer: defaults.incorrectAnswer
        })
        .expect(401);

    });
    it('✅ 1 Player should have 6 score after answered all questions correct and earlier than 2 Player. 2 Player answered all questions incorrect', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);

      await gamesTestManager.answerToAllQuestionsFromFirst(5,firstPlayerToken)
      await gamesTestManager.answerToAllQuestionsFromFirst(0,secondPlayerToken)
      const game = await gamesTestManager.getGameById(createdGame.id, firstPlayerToken);
      console.log("game: ", game);
      const a = 5
      expect(game.firstPlayerProgress.score).toEqual(6)
      expect(game.secondPlayerProgress?.score).toEqual(0);
      expect(game.finishGameDate).toEqual(expect.any(String));

    });
    it('✅ 1 Player should have 0 score after answered all questions incorrectly and earlier than 2 Player. 2 Player answered all questions correctly', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);

      await gamesTestManager.answerToAllQuestionsFromFirst(0,firstPlayerToken)
      await gamesTestManager.answerToAllQuestionsFromFirst(5,secondPlayerToken)
      const game = await gamesTestManager.getGameById(createdGame.id, firstPlayerToken);
      expect(game.firstPlayerProgress.score).toEqual(0)
      expect(game.secondPlayerProgress?.score).toEqual(5);
      expect(game.finishGameDate).toEqual(expect.any(String));

    });
    it('✅ 1 Player should have 0 score after answered all questions incorrectly and later than 2 Player. 2 Player answered all questions incorrectly', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);

      await gamesTestManager.answerToAllQuestionsFromFirst(0,secondPlayerToken)
      await gamesTestManager.answerToAllQuestionsFromFirst(0,firstPlayerToken)
      const game = await gamesTestManager.getGameById(createdGame.id, firstPlayerToken);
      expect(game.firstPlayerProgress.score).toEqual(0)
      expect(game.secondPlayerProgress?.score).toEqual(0);
      expect(game.finishGameDate).toEqual(expect.any(String));

    });
    it('✅ 1 Player should have 2 score after answered 2 questions correctly and later than 2 Player. 2 Player should have 2 score answered 1 questions correctly', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);

      await gamesTestManager.answerToAllQuestionsFromFirst(1,secondPlayerToken)
      await gamesTestManager.answerToAllQuestionsFromFirst(2,firstPlayerToken)
      const game = await gamesTestManager.getGameById(createdGame.id, firstPlayerToken);
      expect(game.firstPlayerProgress.score).toEqual(2)
      expect(game.secondPlayerProgress?.score).toEqual(2);
      expect(game.finishGameDate).toEqual(expect.any(String));

    });
  })
  describe('GET(/pair-game-quiz/pairs/my-current) get current unfinished user game e2e tests', () => {
    beforeAll(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManager = result.userTestManger
      questionsTestManager = result.questionsTestManager
      gamesTestManager = result.gamesTestManager
    });
    beforeEach(async () => {
      await deleteAllData(app);
    });

    it('(200) ✅ Should return current active not answered game for 1st user', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);
      const res1 = await request(app.getHttpServer())
        .get(gamePath + '/my-current')
        .set('Authorization', `Bearer ${firstPlayerToken}`)
        .expect(200);
      const response: GamePairViewDto = res1.body
      expect(response.id).toEqual(expect.any(String))
      expect(response.firstPlayerProgress.answers).toEqual([]);
      expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
      expect(response.firstPlayerProgress.player.login).toEqual(users[0].login);
      expect(response.firstPlayerProgress.score).toEqual(0);
      expect(response.secondPlayerProgress!.answers).toEqual([]);
      expect(response.secondPlayerProgress!.player.id).toEqual(expect.any(String));
      expect(response.secondPlayerProgress!.player.login).toEqual(users[1].login);
      expect(response.secondPlayerProgress!.score).toEqual(0);
      expect(response.questions?.length).toBe(5)
      expect(response.status).toEqual(GameStatus.active);
      expect(response.pairCreatedDate).toEqual(expect.any(String));
      expect(response.startGameDate).toEqual(expect.any(String));
      expect(response.finishGameDate).toBeNull()

    });
    it('(200) ✅ Should return current active game with 1st player answered all questions correctly (5 score) and 2nd player answered one question', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);
      await gamesTestManager.answerToAllQuestionsFromFirst(5,firstPlayerToken)
      await gamesTestManager.answerToQuestion(secondPlayerToken,defaults.correctAnswer)

      const res1 = await request(app.getHttpServer())
        .get(gamePath + '/my-current')
        .set('Authorization', `Bearer ${firstPlayerToken}`)
        .expect(200);
      const response: GamePairViewDto = res1.body
      expect(response.id).toEqual(expect.any(String))
      expect(response.firstPlayerProgress.answers?.length).toEqual(5);
      expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
      expect(response.firstPlayerProgress.player.login).toEqual(users[0].login);
      expect(response.firstPlayerProgress.score).toEqual(5);
      expect(response.secondPlayerProgress!.answers?.length).toEqual(1);
      expect(response.secondPlayerProgress!.player.id).toEqual(expect.any(String));
      expect(response.secondPlayerProgress!.player.login).toEqual(users[1].login);
      expect(response.secondPlayerProgress!.score).toEqual(1);
      expect(response.questions?.length).toBe(5)
      expect(response.status).toEqual(GameStatus.active);
      expect(response.pairCreatedDate).toEqual(expect.any(String));
      expect(response.startGameDate).toEqual(expect.any(String));
      expect(response.finishGameDate).toBeNull()

    });
    it('(404) ❌ Shouldn`t return finished game with all questions answered', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);
      await gamesTestManager.answerToAllQuestionsFromFirst(5,firstPlayerToken)
      await gamesTestManager.answerToAllQuestionsFromFirst(5,secondPlayerToken)

      const res1 = await request(app.getHttpServer())
        .get(gamePath + '/my-current')
        .set('Authorization', `Bearer ${firstPlayerToken}`)
        .expect(404);

    });

    it('(401) ❌ Shouldn`t connect to game with invalid auth', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);
      await gamesTestManager.answerToAllQuestionsFromFirst(5,firstPlayerToken)
      await gamesTestManager.answerToQuestion(secondPlayerToken,defaults.correctAnswer)

      const res1 = await request(app.getHttpServer())
        .get(gamePath + '/my-current')
        .set('Authorization', `Bearer invalidToken`)
        .expect(401);

    });

  })
  describe('GET(/pair-game-quiz/pairs/:id) get current game by gameId e2e tests', () => {
    beforeAll(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManager = result.userTestManger
      questionsTestManager = result.questionsTestManager
      gamesTestManager = result.gamesTestManager
    });
    beforeEach(async () => {
      await deleteAllData(app);
    });
    afterAll(async () => {
      await deleteAllData(app);
    });

    it('(200) ✅ Should return active not answered game', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);
      const res1 = await request(app.getHttpServer())
        .get(gamePath + `/${createdGame.id}`)
        .set('Authorization', `Bearer ${firstPlayerToken}`)
        .expect(200);
      const response: GamePairViewDto = res1.body
      expect(response.id).toEqual(expect.any(String))
      expect(response.firstPlayerProgress.answers).toEqual([]);
      expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
      expect(response.firstPlayerProgress.player.login).toEqual(users[0].login);
      expect(response.firstPlayerProgress.score).toEqual(0);
      expect(response.secondPlayerProgress!.answers).toEqual([]);
      expect(response.secondPlayerProgress!.player.id).toEqual(expect.any(String));
      expect(response.secondPlayerProgress!.player.login).toEqual(users[1].login);
      expect(response.secondPlayerProgress!.score).toEqual(0);
      expect(response.questions?.length).toBe(5)
      expect(response.status).toEqual(GameStatus.active);
      expect(response.pairCreatedDate).toEqual(expect.any(String));
      expect(response.startGameDate).toEqual(expect.any(String));
      expect(response.finishGameDate).toBeNull()

    });
    it('(200) ✅ Should return active game with 1st player answered all questions correctly (5 score) and 2nd player answered one question', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);
      await gamesTestManager.answerToAllQuestionsFromFirst(5,firstPlayerToken)
      await gamesTestManager.answerToQuestion(secondPlayerToken,defaults.correctAnswer)

      const res1 = await request(app.getHttpServer())
        .get(gamePath + `/${createdGame.id}`)
        .set('Authorization', `Bearer ${firstPlayerToken}`)
        .expect(200);
      const response: GamePairViewDto = res1.body
      expect(response.id).toEqual(expect.any(String))
      expect(response.firstPlayerProgress.answers?.length).toEqual(5);
      expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
      expect(response.firstPlayerProgress.player.login).toEqual(users[0].login);
      expect(response.firstPlayerProgress.score).toEqual(5);
      expect(response.secondPlayerProgress!.answers?.length).toEqual(1);
      expect(response.secondPlayerProgress!.player.id).toEqual(expect.any(String));
      expect(response.secondPlayerProgress!.player.login).toEqual(users[1].login);
      expect(response.secondPlayerProgress!.score).toEqual(1);
      expect(response.questions?.length).toBe(5)
      expect(response.status).toEqual(GameStatus.active);
      expect(response.pairCreatedDate).toEqual(expect.any(String));
      expect(response.startGameDate).toEqual(expect.any(String));
      expect(response.finishGameDate).toBeNull()

    });
    it('(200) ✅ Should return finished game with all questions answered', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);
      await gamesTestManager.answerToAllQuestionsFromFirst(5,firstPlayerToken)
      await gamesTestManager.answerToAllQuestionsFromFirst(5,secondPlayerToken)

      const res1 = await request(app.getHttpServer())
        .get(gamePath + `/${createdGame.id}`)
        .set('Authorization', `Bearer ${firstPlayerToken}`)
        .expect(200);
      const response: GamePairViewDto = res1.body
      expect(response.id).toEqual(expect.any(String))
      expect(response.firstPlayerProgress.answers?.length).toEqual(5);
      expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
      expect(response.firstPlayerProgress.player.login).toEqual(users[0].login);
      expect(response.firstPlayerProgress.score).toEqual(6);
      expect(response.secondPlayerProgress!.answers?.length).toEqual(5);
      expect(response.secondPlayerProgress!.player.id).toEqual(expect.any(String));
      expect(response.secondPlayerProgress!.player.login).toEqual(users[1].login);
      expect(response.secondPlayerProgress!.score).toEqual(5);
      expect(response.questions?.length).toBe(5)
      expect(response.status).toEqual(GameStatus.finished);
      expect(response.pairCreatedDate).toEqual(expect.any(String));
      expect(response.startGameDate).toEqual(expect.any(String));
      expect(response.finishGameDate).toEqual(expect.any(String));

    });
    it('(403) ❌ Shouldn`t return finished game with another user token', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(3);
      const [firstPlayerToken, secondPlayerToken, thirdPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);
      await gamesTestManager.answerToAllQuestionsFromFirst(5,firstPlayerToken)
      await gamesTestManager.answerToAllQuestionsFromFirst(5,secondPlayerToken)

      const res1 = await request(app.getHttpServer())
        .get(gamePath + `/${createdGame.id}`)
        .set('Authorization', `Bearer ${thirdPlayerToken}`)
        .expect(403);

    });
    it('(404) ❌ Shouldn`t return non existing game', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);
      await gamesTestManager.answerToAllQuestionsFromFirst(5,firstPlayerToken)
      await gamesTestManager.answerToAllQuestionsFromFirst(5,secondPlayerToken)
      const randomGameId = "eaeab0cf-3a8c-4767-b850-97e572abeee7"

      const res1 = await request(app.getHttpServer())
        .get(gamePath + `/${randomGameId}`)
        .set('Authorization', `Bearer ${firstPlayerToken}`)
        .expect(404);

    });
    it('(400) ❌ Shouldn`t return game with invalid uri', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);
      await gamesTestManager.answerToAllQuestionsFromFirst(5,firstPlayerToken)
      await gamesTestManager.answerToAllQuestionsFromFirst(5,secondPlayerToken)

      const res1 = await request(app.getHttpServer())
        .get(gamePath + `/randomId`)
        .set('Authorization', `Bearer ${firstPlayerToken}`)
        .expect(400);

    });

    it('(401) ❌ Shouldn`t return game with invalid auth', async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(2);
      const [firstPlayerToken, secondPlayerToken] = accessTokens;
      const questions = await questionsTestManager.createFivePublishedQuestions()
      const createdGame = await gamesTestManager.createGame(firstPlayerToken, secondPlayerToken);
      await gamesTestManager.answerToAllQuestionsFromFirst(5,firstPlayerToken)
      await gamesTestManager.answerToQuestion(secondPlayerToken,defaults.correctAnswer)

      const res1 = await request(app.getHttpServer())
        .get(gamePath + `/${createdGame.id}`)
        .set('Authorization', `Bearer invalidToken`)
        .expect(401);

    });

  })
  describe('Complex dependent games e2e tests', () => {
    beforeAll(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManager = result.userTestManger
      questionsTestManager = result.questionsTestManager
      gamesTestManager = result.gamesTestManager
      await deleteAllData(app)
    });
    let aToken1;
    let aToken2;
    let aToken3;
    let aToken4;
    let aToken5;
    let aToken6;
    let questions
    let createdUsers

    it(`Should create and login 6 users;`, async () => {
      const { users, accessTokens } = await userTestManager.createUsersBySAAndLogin(6)
      const [token1, token2,token3,token4, token5, token6] = accessTokens;
      aToken1 = token1;
      aToken2 = token2;
      aToken3 = token3;
      aToken4 = token4;
      aToken5 = token5;
      aToken6 = token6;
      createdUsers = users
    })
    it(`Should create and login 6 users;`, async () => {
       questions = await questionsTestManager.createFivePublishedQuestions()
    })
    it(`(200) ✅ create new active game by user1, 
                        then get the game by user1, 
                        then call "/pair-game-quiz/pairs/my-current" by user1. 
                        Should return new created active game; status 200`,
      async () => {

        const connectToGameRes = await request(app.getHttpServer())
          .post(gamePath + '/connection')
          .set('Authorization', `Bearer ${aToken1}`)
          .expect(200);
        let response: GamePairViewDto = connectToGameRes.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers).toEqual([]);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
        expect(response.firstPlayerProgress.score).toEqual(0);
        expect(response.secondPlayerProgress).toBeNull();
        expect(response.questions).toBeNull();
        expect(response.status).toEqual(GameStatus.pending);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toBeNull()
        expect(response.finishGameDate).toBeNull()

        const getByGameIdRes = await request(app.getHttpServer())
          .get(gamePath + `/${response.id}`)
          .set('Authorization', `Bearer ${aToken1}`)
          .expect(200);
        response = getByGameIdRes.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers).toEqual([]);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
        expect(response.firstPlayerProgress.score).toEqual(0);
        expect(response.secondPlayerProgress).toBeNull();
        expect(response.questions).toBeNull();
        expect(response.status).toEqual(GameStatus.pending);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toBeNull()
        expect(response.finishGameDate).toBeNull()

        const getCurRes = await request(app.getHttpServer())
          .get(gamePath + '/my-current')
          .set('Authorization', `Bearer ${aToken1}`)
          .expect(200);
        response = getCurRes.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers).toEqual([]);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
        expect(response.firstPlayerProgress.score).toEqual(0);
        expect(response.secondPlayerProgress).toBeNull();
        expect(response.questions).toBeNull();
        expect(response.status).toEqual(GameStatus.pending);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toBeNull()
        expect(response.finishGameDate).toBeNull()
      });



    it(`(200) ✅ POST -> "/pair-game-quiz/pairs/connection", 
                        GET -> "/pair-game-quiz/pairs/:id", 
                        GET -> "/pair-game-quiz/pairs/my-current": 
                        connect to existing game by user2; 
                        then get the game by user1, user2; 
                        then call "/pair-game-quiz/pairs/my-current" by user1, user2. 
                        Should return started game; status 200`,
      async () => {

      const connectToGameRes = await request(app.getHttpServer())
          .post(gamePath + '/connection')
          .set('Authorization', `Bearer ${aToken2}`)
          .expect(200);
        let response: GamePairViewDto = connectToGameRes.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers).toEqual([]);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
        expect(response.firstPlayerProgress.score).toEqual(0);
        expect(response.secondPlayerProgress?.answers).toEqual([]);
        expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
        expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
        expect(response.secondPlayerProgress?.score).toEqual(0);
        expect(response.questions?.length).toBe(5);
        expect(response.status).toEqual(GameStatus.active);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toEqual(expect.any(String));
        expect(response.finishGameDate).toBeNull()

        const getByGameIdResByU1 = await request(app.getHttpServer())
          .get(gamePath + `/${response.id}`)
          .set('Authorization', `Bearer ${aToken1}`)
          .expect(200);
        response = getByGameIdResByU1.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers).toEqual([]);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
        expect(response.firstPlayerProgress.score).toEqual(0);
        expect(response.secondPlayerProgress?.answers).toEqual([]);
        expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
        expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
        expect(response.secondPlayerProgress?.score).toEqual(0);
        expect(response.questions?.length).toBe(5);
        expect(response.status).toEqual(GameStatus.active);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toEqual(expect.any(String));
        expect(response.finishGameDate).toBeNull()

        const getByGameIdResByU2 = await request(app.getHttpServer())
          .get(gamePath + `/${response.id}`)
          .set('Authorization', `Bearer ${aToken2}`)
          .expect(200);
        response = getByGameIdResByU2.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers).toEqual([]);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
        expect(response.firstPlayerProgress.score).toEqual(0);
        expect(response.secondPlayerProgress?.answers).toEqual([]);
        expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
        expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
        expect(response.secondPlayerProgress?.score).toEqual(0);
        expect(response.questions?.length).toBe(5);
        expect(response.status).toEqual(GameStatus.active);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toEqual(expect.any(String));
        expect(response.finishGameDate).toBeNull()

        const getCurResByU1 = await request(app.getHttpServer())
          .get(gamePath + '/my-current')
          .set('Authorization', `Bearer ${aToken1}`)
          .expect(200);
        response = getCurResByU1.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers).toEqual([]);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
        expect(response.firstPlayerProgress.score).toEqual(0);
        expect(response.secondPlayerProgress?.answers).toEqual([]);
        expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
        expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
        expect(response.secondPlayerProgress?.score).toEqual(0);
        expect(response.questions?.length).toBe(5);
        expect(response.status).toEqual(GameStatus.active);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toEqual(expect.any(String));
        expect(response.finishGameDate).toBeNull()

        const getCurResByU2 = await request(app.getHttpServer())
          .get(gamePath + '/my-current')
          .set('Authorization', `Bearer ${aToken2}`)
          .expect(200);
        response = getCurResByU2.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers).toEqual([]);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
        expect(response.firstPlayerProgress.score).toEqual(0);
        expect(response.secondPlayerProgress?.answers).toEqual([]);
        expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
        expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
        expect(response.secondPlayerProgress?.score).toEqual(0);
        expect(response.questions?.length).toBe(5);
        expect(response.status).toEqual(GameStatus.active);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toEqual(expect.any(String));
        expect(response.finishGameDate).toBeNull()
     });
    it(`(200) ✅ POST -> "/pair-game-quiz/pairs/my-current/answers", 
                        GET -> "/pair-game-quiz/pairs", 
                        GET -> "/pair-game-quiz/pairs/my-current": 
                        add answers to first game, created by user1, connected by user2: 
                        add correct answer by firstPlayer; 
                        add incorrect answer by secondPlayer; 
                        add correct answer by secondPlayer;
                        get active game and call "/pair-game-quiz/pairs/my-current by both users after each answer";
                        status 200;`,
      async () => {

        const addCorAnsByU1Res = await request(app.getHttpServer())
          .post(gamePath + '/my-current/answers')
          .set('Authorization', `Bearer ${aToken1}`)
          .send({
            answer: defaults.correctAnswer
          })
        const getCur1ResByU1 = await request(app.getHttpServer())
          .get(gamePath + '/my-current')
          .set('Authorization', `Bearer ${aToken1}`)
          .expect(200);
        let response: GamePairViewDto = getCur1ResByU1.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers?.length).toEqual(1);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
        expect(response.firstPlayerProgress.score).toEqual(1);
        expect(response.secondPlayerProgress?.answers).toEqual([]);
        expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
        expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
        expect(response.secondPlayerProgress?.score).toEqual(0);
        expect(response.questions?.length).toBe(5);
        expect(response.status).toEqual(GameStatus.active);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toEqual(expect.any(String));
        expect(response.finishGameDate).toBeNull()

        const getCur1ResByU2 = await request(app.getHttpServer())
          .get(gamePath + '/my-current')
          .set('Authorization', `Bearer ${aToken2}`)
          .expect(200);
        response = getCur1ResByU2.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers?.length).toEqual(1);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
        expect(response.firstPlayerProgress.score).toEqual(1);
        expect(response.secondPlayerProgress?.answers).toEqual([]);
        expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
        expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
        expect(response.secondPlayerProgress?.score).toEqual(0);
        expect(response.questions?.length).toBe(5);
        expect(response.status).toEqual(GameStatus.active);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toEqual(expect.any(String));
        expect(response.finishGameDate).toBeNull()

        const addIncorAnsByU2Res = await request(app.getHttpServer())
          .post(gamePath + '/my-current/answers')
          .set('Authorization', `Bearer ${aToken2}`)
          .send({
            answer: defaults.incorrectAnswer
          })
        const getCur2ResByU1 = await request(app.getHttpServer())
          .get(gamePath + '/my-current')
          .set('Authorization', `Bearer ${aToken1}`)
          .expect(200);
         response = getCur2ResByU1.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers?.length).toEqual(1);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
        expect(response.firstPlayerProgress.score).toEqual(1);
        expect(response.secondPlayerProgress?.answers?.length).toEqual(1);
        expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
        expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
        expect(response.secondPlayerProgress?.score).toEqual(0);
        expect(response.questions?.length).toBe(5);
        expect(response.status).toEqual(GameStatus.active);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toEqual(expect.any(String));
        expect(response.finishGameDate).toBeNull()

        const getCur2ResByU2 = await request(app.getHttpServer())
          .get(gamePath + '/my-current')
          .set('Authorization', `Bearer ${aToken2}`)
          .expect(200);
        response = getCur2ResByU2.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers?.length).toEqual(1);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
        expect(response.firstPlayerProgress.score).toEqual(1);
        expect(response.secondPlayerProgress?.answers?.length).toEqual(1);
        expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
        expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
        expect(response.secondPlayerProgress?.score).toEqual(0);
        expect(response.questions?.length).toBe(5);
        expect(response.status).toEqual(GameStatus.active);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toEqual(expect.any(String));
        expect(response.finishGameDate).toBeNull()

        const addCorAnsByU2Res = await request(app.getHttpServer())
          .post(gamePath + '/my-current/answers')
          .set('Authorization', `Bearer ${aToken2}`)
          .send({
            answer: defaults.correctAnswer
          })
        const getCur3ResByU1 = await request(app.getHttpServer())
          .get(gamePath + '/my-current')
          .set('Authorization', `Bearer ${aToken1}`)
          .expect(200);
        response = getCur3ResByU1.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers?.length).toEqual(1);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
        expect(response.firstPlayerProgress.score).toEqual(1);
        expect(response.secondPlayerProgress?.answers?.length).toEqual(2);
        expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
        expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
        expect(response.secondPlayerProgress?.score).toEqual(1);
        expect(response.questions?.length).toBe(5);
        expect(response.status).toEqual(GameStatus.active);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toEqual(expect.any(String));
        expect(response.finishGameDate).toBeNull()

        const getCur3ResByU2 = await request(app.getHttpServer())
          .get(gamePath + '/my-current')
          .set('Authorization', `Bearer ${aToken2}`)
          .expect(200);
        response = getCur3ResByU2.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers?.length).toEqual(1);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
        expect(response.firstPlayerProgress.score).toEqual(1);
        expect(response.secondPlayerProgress?.answers?.length).toEqual(2);
        expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
        expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
        expect(response.secondPlayerProgress?.score).toEqual(1);
        expect(response.questions?.length).toBe(5);
        expect(response.status).toEqual(GameStatus.active);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toEqual(expect.any(String));
        expect(response.finishGameDate).toBeNull()
      });
    it(`(200) ✅ POST -> "/pair-game-quiz/pairs/my-current/answers", 
                        GET -> "/pair-game-quiz/pairs", 
                        GET -> "/pair-game-quiz/pairs/my-current": 
                        create second game by user3, 
                        connect to the game by user4, 
                        then: add correct answer by firstPlayer; 
                        add incorrect answer by secondPlayer; 
                        add correct answer by secondPlayer; 
                        get active game 
                        and call "/pair-game-quiz/pairs/my-current by both users after each answer"; 
                        status 200`,
      async () => {

        const createSecondGameResByU3 = await request(app.getHttpServer())
          .post(gamePath + '/connection')
          .set('Authorization', `Bearer ${aToken3}`)
          .expect(200);
        let response: GamePairViewDto = createSecondGameResByU3.body
        console.log("response: ",response);
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers).toEqual([]);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[2].login);
        expect(response.firstPlayerProgress.score).toEqual(0);
        expect(response.secondPlayerProgress).toBeNull();
        expect(response.questions).toBeNull();
        expect(response.status).toEqual(GameStatus.pending);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toBeNull()
        expect(response.finishGameDate).toBeNull()

        const connectSecondGameResByU4 = await request(app.getHttpServer())
          .post(gamePath + '/connection')
          .set('Authorization', `Bearer ${aToken4}`)
          .expect(200);
        response = connectSecondGameResByU4.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers).toEqual([]);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[2].login);
        expect(response.firstPlayerProgress.score).toEqual(0);
        expect(response.secondPlayerProgress?.answers).toEqual([]);
        expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
        expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[3].login);
        expect(response.secondPlayerProgress?.score).toEqual(0);
        expect(response.questions?.length).toBe(5);
        expect(response.status).toEqual(GameStatus.active);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toEqual(expect.any(String));
        expect(response.finishGameDate).toBeNull()

        const getCur1ResByU3 = await request(app.getHttpServer())
          .get(gamePath + '/my-current')
          .set('Authorization', `Bearer ${aToken3}`)
          .expect(200);
        response = getCur1ResByU3.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers).toEqual([]);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[2].login);
        expect(response.firstPlayerProgress.score).toEqual(0);
        expect(response.secondPlayerProgress?.answers).toEqual([]);
        expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
        expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[3].login);
        expect(response.secondPlayerProgress?.score).toEqual(0);
        expect(response.questions?.length).toBe(5);
        expect(response.status).toEqual(GameStatus.active);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toEqual(expect.any(String));
        expect(response.finishGameDate).toBeNull()

        const getCur1ResByU4 = await request(app.getHttpServer())
          .get(gamePath + '/my-current')
          .set('Authorization', `Bearer ${aToken4}`)
          .expect(200);
        response = getCur1ResByU4.body
        expect(response.id).toEqual(expect.any(String))
        expect(response.firstPlayerProgress.answers).toEqual([]);
        expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
        expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[2].login);
        expect(response.firstPlayerProgress.score).toEqual(0);
        expect(response.secondPlayerProgress?.answers).toEqual([]);
        expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
        expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[3].login);
        expect(response.secondPlayerProgress?.score).toEqual(0);
        expect(response.questions?.length).toBe(5);
        expect(response.status).toEqual(GameStatus.active);
        expect(response.pairCreatedDate).toEqual(expect.any(String));
        expect(response.startGameDate).toEqual(expect.any(String));
        expect(response.finishGameDate).toBeNull()
      });
    // it(`(200) ✅ POST -> "/pair-game-quiz/pairs/my-current/answers",
    //                    GET -> "/pair-game-quiz/pairs",
    //                    GET -> "/pair-game-quiz/pairs/my-current":
    //                    add answers to first game, created by user1, connected by user2:
    //                    add correct answer by firstPlayer;
    //                    add correct answer by firstPlayer;
    //                    add correct answer by secondPlayer;
    //                    add correct answer by secondPlayer;
    //                    add incorrect answer by firstPlayer;
    //                    add correct answer by firstPlayer;
    //                    add correct answer by secondPlayer;
    //                    firstPlayer should win with 5 scores;
    //                    get active game and call "/pair-game-quiz/pairs/my-current by both users after each answer";
    //                    status 200;`,
    //   async () => {
    //
    //     const addCorAnsByU1Res = await request(app.getHttpServer())
    //       .post(gamePath + '/my-current/answers')
    //       .set('Authorization', `Bearer ${aToken1}`)
    //       .send({
    //         answer: defaults.correctAnswer
    //       })
    //     const getCur1ResByU1 = await request(app.getHttpServer())
    //       .get(gamePath + '/my-current')
    //       .set('Authorization', `Bearer ${aToken1}`)
    //       .expect(200);
    //     let response = getCur1ResByU1.body;
    //     expect(response.id).toEqual(expect.any(String))
    //     expect(response.firstPlayerProgress.answers?.length).toEqual(2);
    //     expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
    //     expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
    //     expect(response.firstPlayerProgress.score).toEqual(2);
    //     expect(response.secondPlayerProgress?.answers?.length).toEqual(2);
    //     expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
    //     expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
    //     expect(response.secondPlayerProgress?.score).toEqual(1);
    //     expect(response.questions?.length).toBe(5);
    //     expect(response.status).toEqual(GameStatus.active);
    //     expect(response.pairCreatedDate).toEqual(expect.any(String));
    //     expect(response.startGameDate).toEqual(expect.any(String));
    //     expect(response.finishGameDate).toBeNull()
    //
    //     const addCor2AnsByU1Res = await request(app.getHttpServer())
    //       .post(gamePath + '/my-current/answers')
    //       .set('Authorization', `Bearer ${aToken1}`)
    //       .send({
    //         answer: defaults.correctAnswer
    //       })
    //       .expect(200)
    //     const getCur2ResByU1 = await request(app.getHttpServer())
    //       .get(gamePath + '/my-current')
    //       .set('Authorization', `Bearer ${aToken1}`)
    //       .expect(200);
    //     response = getCur2ResByU1.body;
    //     expect(response.id).toEqual(expect.any(String))
    //     expect(response.firstPlayerProgress.answers?.length).toEqual(3);
    //     expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
    //     expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
    //     expect(response.firstPlayerProgress.score).toEqual(3);
    //     expect(response.secondPlayerProgress?.answers?.length).toEqual(2);
    //     expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
    //     expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
    //     expect(response.secondPlayerProgress?.score).toEqual(1);
    //     expect(response.questions?.length).toBe(5);
    //     expect(response.status).toEqual(GameStatus.active);
    //     expect(response.pairCreatedDate).toEqual(expect.any(String));
    //     expect(response.startGameDate).toEqual(expect.any(String));
    //     expect(response.finishGameDate).toBeNull()
    //
    //     const addCor2AnsByU2Res = await request(app.getHttpServer())
    //       .post(gamePath + '/my-current/answers')
    //       .set('Authorization', `Bearer ${aToken2}`)
    //       .send({
    //         answer: defaults.correctAnswer
    //       })
    //     const getCur1ResByU2 = await request(app.getHttpServer())
    //       .get(gamePath + '/my-current')
    //       .set('Authorization', `Bearer ${aToken2}`)
    //       .expect(200);
    //     response = getCur2ResByU1.body;
    //     expect(response.id).toEqual(expect.any(String))
    //     expect(response.firstPlayerProgress.answers?.length).toEqual(3);
    //     expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
    //     expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
    //     expect(response.firstPlayerProgress.score).toEqual(3);
    //     expect(response.secondPlayerProgress?.answers?.length).toEqual(3);
    //     expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
    //     expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
    //     expect(response.secondPlayerProgress?.score).toEqual(2);
    //     expect(response.questions?.length).toBe(5);
    //     expect(response.status).toEqual(GameStatus.active);
    //     expect(response.pairCreatedDate).toEqual(expect.any(String));
    //     expect(response.startGameDate).toEqual(expect.any(String));
    //     expect(response.finishGameDate).toBeNull()
    //
    //     const addCor3AnsByU2Res = await request(app.getHttpServer())
    //       .post(gamePath + '/my-current/answers')
    //       .set('Authorization', `Bearer ${aToken2}`)
    //       .send({
    //         answer: defaults.correctAnswer
    //       })
    //     const getCur3ResByU2 = await request(app.getHttpServer())
    //       .get(gamePath + '/my-current')
    //       .set('Authorization', `Bearer ${aToken2}`)
    //       .expect(200);
    //     response = getCur2ResByU1.body;
    //     expect(response.id).toEqual(expect.any(String))
    //     expect(response.firstPlayerProgress.answers?.length).toEqual(3);
    //     expect(response.firstPlayerProgress.player.id).toEqual(expect.any(String));
    //     expect(response.firstPlayerProgress.player.login).toEqual(createdUsers[0].login);
    //     expect(response.firstPlayerProgress.score).toEqual(3);
    //     expect(response.secondPlayerProgress?.answers?.length).toEqual(4);
    //     expect(response.secondPlayerProgress?.player.id).toEqual(expect.any(String));
    //     expect(response.secondPlayerProgress?.player.login).toEqual(createdUsers[1].login);
    //     expect(response.secondPlayerProgress?.score).toEqual(3);
    //     expect(response.questions?.length).toBe(5);
    //     expect(response.status).toEqual(GameStatus.active);
    //     expect(response.pairCreatedDate).toEqual(expect.any(String));
    //     expect(response.startGameDate).toEqual(expect.any(String));
    //     expect(response.finishGameDate).toBeNull()
    //  })
  });
})