import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersTestManager } from './e2e/helpers/test-managers/users-test-manager';
import { initSettings } from './e2e/helpers/testing-app-init';
import { deleteAllData } from './e2e/helpers/delete-all-data';
import { SessionsTestManager } from './e2e/helpers/test-managers/sessions-test-manager';
import { delay } from './e2e/helpers/delay';

describe('Sessions flow (e2e) tests', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;
  let sessionTestManager: SessionsTestManager;

  afterAll(async () => {
    await app.close();
  });
  const defaults = {
    login: 'newLogin',
    email: 'newEmail@mail.ru',
    password: 'newPassword',
  };
  const getSessionsPath = '/security/devices';

  describe('GET(/security/devices) get sessions e2e tests', () => {
    beforeEach(async () => {
      // const result = await initSettings((moduleBuilder) =>
      //   moduleBuilder.overrideProvider(JwtService).useValue(
      //     new JwtService({
      //       secret: 'secret_key',
      //       signOptions: { expiresIn: '1m' },
      //     }),
      //   ),
      // );
      const result = await initSettings();
      app = result.app;
      sessionTestManager = result.sessionTestManager;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(200) ✅ Should get sessions with correct input', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken, refreshToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );

      const res = await request(app.getHttpServer())
        .get(getSessionsPath)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.length).toBe(1);
    });
    it('(200) ✅ Should get 4 sessions with correct input', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const result =
        await sessionTestManager.createSeveralSessionsForCurrentUser(
          4,
          defaults.login,
          defaults.password,
        );

      const res = await request(app.getHttpServer())
        .get(getSessionsPath)
        .set('Cookie', `refreshToken=${result.rTokenArray[0]}`)
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.length).toBe(4);
      console.log(res.body);
    });
    it('(401) ❌ Shouldn`t get sessions with input access token', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken, refreshToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const res = await request(app.getHttpServer())
        .get(getSessionsPath)
        .set('Cookie', `refreshToken=${accessToken}`)
        .expect(401);
      const foundSessionAfterDelete =
        await sessionTestManager.getSessionByUserId(createdUser._id.toString());
      expect(foundSessionAfterDelete.length).toBe(1);
    });
    it('(401) ❌ Shouldn`t get sessions with input refreshToken which session not in db', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken, refreshToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const { deviceId } =
        await userTestManger.decodeRefreshToken(refreshToken);
      await sessionTestManager.deleteSpecifiedSession(deviceId);
      const res = await request(app.getHttpServer())
        .get(getSessionsPath)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(401);
      const foundSessionAfterDelete =
        await sessionTestManager.getSessionByUserId(createdUser._id.toString());
      expect(foundSessionAfterDelete.length).toBe(0);
    });
  });

  describe('DELETE(/security/devices/:sessionId) delete specified sessions e2e tests', () => {
    beforeEach(async () => {
      // const result = await initSettings((moduleBuilder) =>
      //   moduleBuilder.overrideProvider(JwtService).useValue(
      //     new JwtService({
      //       secret: 'secret_key',
      //       signOptions: { expiresIn: '1m' },
      //     }),
      //   ),
      // );
      const result = await initSettings();
      app = result.app;
      sessionTestManager = result.sessionTestManager;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ Should delete session with correct input', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { refreshToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const decodedToken =
        await userTestManger.decodeRefreshToken(refreshToken);
      const res = await request(app.getHttpServer())
        .delete(`/security/devices/${decodedToken.deviceId}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(204);
      const foundSessionAfterDelete =
        await sessionTestManager.getSessionByUserId(createdUser._id.toString());
      expect(foundSessionAfterDelete.length).toBe(0);
    });

    it('(404) ❌ Shouldn`t delete session with invalid input uri param', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const invalidUriParam = true;
      const { refreshToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const res = await request(app.getHttpServer())
        .delete(`/security/devices/${invalidUriParam}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(404);
      const foundSessionAfterDelete =
        await sessionTestManager.getSessionByUserId(createdUser._id.toString());
      expect(foundSessionAfterDelete.length).toBe(1);
    });
    it('(403) ❌ Shouldn`t delete session for another user', async () => {
      const createdUser1 = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const createdUser2 = await userTestManger.createUserByRegistration(
        'newLogin2',
        defaults.password + '2',
        'newEmail2@mail.ru',
      );
      const invalidUriParam = true;
      const result1 = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const decodedRToken1 = await userTestManger.decodeRefreshToken(
        result1.refreshToken,
      );
      const result2 = await userTestManger.loginUser(
        'newLogin2',
        defaults.password + '2',
      );
      const res = await request(app.getHttpServer())
        .delete(`/security/devices/${decodedRToken1.deviceId}`)
        .set('Cookie', `refreshToken=${result2.refreshToken}`)
        .expect(403);
      const foundSessionAfterDelete =
        await sessionTestManager.getSessionByUserId(
          createdUser1._id.toString(),
        );
      expect(foundSessionAfterDelete.length).toBe(1);
    });
    it('(404) ❌ Shouldn`t delete delete session for invalid session id', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const invalidSessionId = '661b5bd2-b00c-4a20-9b8c-9556ba7b6ab3';
      const { refreshToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const res = await request(app.getHttpServer())
        .delete(`/security/devices/${invalidSessionId}`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(404);
      const foundSessionAfterDelete =
        await sessionTestManager.getSessionByUserId(createdUser._id.toString());
      expect(foundSessionAfterDelete.length).toBe(1);
    });
  });

  describe('DELETE(/security/devices/) delete all sessions exclude current e2e tests', () => {
    beforeEach(async () => {
      // const result = await initSettings((moduleBuilder) =>
      //   moduleBuilder.overrideProvider(JwtService).useValue(
      //     new JwtService({
      //       secret: 'secret_key',
      //       signOptions: { expiresIn: '1m' },
      //     }),
      //   ),
      // );
      const result = await initSettings();
      app = result.app;
      sessionTestManager = result.sessionTestManager;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ Should delete 3 sessions for user with 4 sessions with correct input', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { rTokenArray } =
        await sessionTestManager.createSeveralSessionsForCurrentUser(
          4,
          defaults.login,
          defaults.password,
        );
      const foundSessionBeforeDelete =
        await sessionTestManager.getSessionByUserId(createdUser._id.toString());
      expect(foundSessionBeforeDelete.length).toBe(4);
      const res = await request(app.getHttpServer())
        .delete(`/security/devices`)
        .set('Cookie', `refreshToken=${rTokenArray[0]}`)
        .expect(204);
      const foundSessionAfterDelete =
        await sessionTestManager.getSessionByUserId(createdUser._id.toString());
      expect(foundSessionAfterDelete.length).toBe(1);
    });
    it('(204) ✅ Should delete 0 sessions for user with 1 session with correct input', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { rTokenArray } =
        await sessionTestManager.createSeveralSessionsForCurrentUser(
          1,
          defaults.login,
          defaults.password,
        );
      const foundSessionBeforeDelete =
        await sessionTestManager.getSessionByUserId(createdUser._id.toString());
      expect(foundSessionBeforeDelete.length).toBe(1);
      const res = await request(app.getHttpServer())
        .delete(`/security/devices`)
        .set('Cookie', `refreshToken=${rTokenArray[0]}`)
        .expect(204);
      const foundSessionAfterDelete =
        await sessionTestManager.getSessionByUserId(createdUser._id.toString());
      expect(foundSessionAfterDelete.length).toBe(1);
    });

    it('(401) ❌ Shouldn`t delete delete sessions with invalid token', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const invalidToken = true;
      const { refreshToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const res = await request(app.getHttpServer())
        .delete(`/security/devices`)
        .set('Cookie', `refreshToken=${invalidToken}`)
        .expect(401);
      const foundSessionAfterDelete =
        await sessionTestManager.getSessionByUserId(createdUser._id.toString());
      expect(foundSessionAfterDelete.length).toBe(1);
    });
    it('(401) ❌ Shouldn`t delete session for deleted user', async () => {
      const createdUser1 = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );

      const { refreshToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      await userTestManger.deleteUserById(createdUser1._id.toString());
      const res = await request(app.getHttpServer())
        .delete(`/security/devices/`)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(401);
      const foundSessionAfterDelete =
        await sessionTestManager.getSessionByUserId(
          createdUser1._id.toString(),
        );
      expect(foundSessionAfterDelete.length).toBe(1);
    });
  });

  describe('Complex sessions test e2e ', () => {
    beforeEach(async () => {
      // const result = await initSettings((moduleBuilder) =>
      //   moduleBuilder.overrideProvider(JwtService).useValue(
      //     new JwtService({
      //       secret: 'secret_key',
      //       signOptions: { expiresIn: '1m' },
      //     }),
      //   ),
      // );
      const result = await initSettings();
      app = result.app;
      sessionTestManager = result.sessionTestManager;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ complex test for sessions', async () => {
      const user = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );

      const sessionsResult =
        await sessionTestManager.createSeveralSessionsForCurrentUser(
          4,
          defaults.login,
          defaults.password,
        );

      await delay(2000);

      const refreshTokenResponse = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set('Cookie', [`refreshToken=${sessionsResult.rTokenArray[0]}`])
        .expect(200);
      const updatedRefreshTokenFor1Session = refreshTokenResponse.headers[
        'set-cookie'
      ][0]
        .split('=')[1]
        .split(';')[0];
      expect(updatedRefreshTokenFor1Session).not.toBe(
        sessionsResult.rTokenArray[0],
      );

      const getSessionsResponse = await request(app.getHttpServer())
        .get('/security/devices')
        .set('Cookie', [`refreshToken=${updatedRefreshTokenFor1Session}`])
        .expect(200);
      const decodedSession1RefreshToken =
        await userTestManger.decodeRefreshToken(sessionsResult.rTokenArray[0]);
      const decodedSession2RefreshToken =
        await userTestManger.decodeRefreshToken(sessionsResult.rTokenArray[1]);
      const decodedSession3RefreshToken =
        await userTestManger.decodeRefreshToken(sessionsResult.rTokenArray[2]);
      const decodedSession4RefreshToken =
        await userTestManger.decodeRefreshToken(sessionsResult.rTokenArray[3]);

      expect(getSessionsResponse.body.length).toBe(4);
      expect(getSessionsResponse.body[0].deviceId).toBe(
        decodedSession1RefreshToken.deviceId,
      );
      expect(getSessionsResponse.body[0].lastActiveDate).not.toBe(
        decodedSession1RefreshToken.iat,
      );

      expect(getSessionsResponse.body[1].deviceId).toBe(
        decodedSession2RefreshToken.deviceId,
      );
      expect(getSessionsResponse.body[1].lastActiveDate).toBe(
        decodedSession2RefreshToken.iat,
      );

      expect(getSessionsResponse.body[2].deviceId).toBe(
        decodedSession3RefreshToken.deviceId,
      );
      expect(getSessionsResponse.body[2].lastActiveDate).toBe(
        decodedSession3RefreshToken.iat,
      );

      expect(getSessionsResponse.body[3].deviceId).toBe(
        decodedSession4RefreshToken.deviceId,
      );
      expect(getSessionsResponse.body[3].lastActiveDate).toBe(
        decodedSession4RefreshToken.iat,
      );

      const deletedSession2Result = await request(app.getHttpServer())
        .delete(`/security/devices/${decodedSession2RefreshToken.deviceId}`)
        .set('Cookie', [`refreshToken=${updatedRefreshTokenFor1Session}`])
        .expect(204);
      const get3SessionsResponse = await request(app.getHttpServer())
        .get('/security/devices')
        .set('Cookie', [`refreshToken=${updatedRefreshTokenFor1Session}`])
        .expect(200);
      expect(get3SessionsResponse.body.length).toBe(3);
      expect(get3SessionsResponse.body).not.toContainEqual(
        getSessionsResponse.body[1],
      );

      const loggedOutSession3Result = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', [`refreshToken=${sessionsResult.rTokenArray[2]}`])
        .expect(204);
      const get2SessionResponse = await request(app.getHttpServer())
        .get('/security/devices')
        .set('Cookie', [`refreshToken=${updatedRefreshTokenFor1Session}`])
        .expect(200);
      expect(get2SessionResponse.body.length).toBe(2);
      expect(get2SessionResponse.body).not.toContainEqual(
        getSessionsResponse.body[2],
      );

      const deletedAllSessionExclude1stResult = await request(
        app.getHttpServer(),
      )
        .delete(`/security/devices`)
        .set('Cookie', [`refreshToken=${updatedRefreshTokenFor1Session}`]);
      expect(204);

      const get1SessionResponse = await request(app.getHttpServer())
        .get('/security/devices')
        .set('Cookie', [`refreshToken=${updatedRefreshTokenFor1Session}`])
        .expect(200);
      expect(get1SessionResponse.body.length).toBe(1);
      expect(get1SessionResponse.body).not.toContainEqual(
        getSessionsResponse.body[3],
      );
    });
  });
});