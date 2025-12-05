import request from 'supertest';
import { UsersTestManager } from './helpers/test-managers/users-test-manager';
import { initSettings } from './helpers/testing-app-init';
import { deleteAllData } from './helpers/delete-all-data';
import { mockedRandomServiceReturnedUUId } from '../mock/random-service-mock';
import { INestApplication } from '@nestjs/common';
import { SessionsTestManager } from './helpers/test-managers/sessions-test-manager';
import { delay } from './helpers/delay';

describe('Authorization flow (e2e) tests', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;
  let sessionsTestManager: SessionsTestManager

  afterAll(async () => {
    await app.close();
  });
  const defaults = {
    login: 'newLogin',
    email: 'newEmail@mail.ru',
    password: 'newPassword',
    newPassword: 'newNewPassword',
  };
  const loginPath = '/auth/login';
  const registrationPath = '/auth/registration';
  const regConfPath = '/auth/registration-confirmation';
  const regEmailResPath = '/auth/registration-email-resending';
  const passRecoveryPath = '/auth/password-recovery';
  const newPassPath = '/auth/new-password';
  const mePath = '/auth/me';
  const logoutPath = '/auth/logout';
  const refreshTokenPath = '/auth/refresh-token';

  describe('(/auth/login) Login e2e tests', () => {
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
      userTestManger = result.userTestManger;
      sessionsTestManager = result.sessionTestManager
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(200) ✅ Should login user with correct credentials', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const response = await request(app.getHttpServer())
        .post(loginPath)
        .send({
          loginOrEmail: defaults.login,
          password: defaults.password,
        })
        .expect(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.accessToken).toEqual(expect.any(String));
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0].startsWith("refreshToken=")).toBeTruthy();
      const session = await sessionsTestManager.getSessionByUserId(createdUser.id);
      expect(session.length).toBe(1);

    },10000);
    it('(400) ❌ Shouldn`t login user with invalid login', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const invalidLogin = true;
      const response = await request(app.getHttpServer())
        .post(loginPath)
        .send({
          loginOrEmail: invalidLogin,
          password: defaults.password,
        })
        .expect(400);
      expect(response.body.errorsMessages[0].field).toBe('loginOrEmail');
      const session = await sessionsTestManager.getSessionByUserId(createdUser.id);
      expect(session.length).toBe(0);
    },10000);
    it('(400) ❌ Shouldn`t login user with invalid email and password', async () => {
      const createdUser =await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const invalidEmail = true;
      const invalidPassword = 4;
      const response = await request(app.getHttpServer())
        .post(loginPath)
        .send({
          loginOrEmail: invalidEmail,
          password: invalidPassword,
        })
        .expect(400);
      expect(response.body.errorsMessages.length).toBe(2);
      expect(response.body.errorsMessages[0].field).toBe('loginOrEmail');
      expect(response.body.errorsMessages[1].field).toBe('password');

      const session = await sessionsTestManager.getSessionByUserId(createdUser.id);
      expect(session.length).toBe(0);
    });
    it('(401) ❌ Shouldn`t login user with incorrect login', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const incorrectLogin = 'incorrectLogin';
      await request(app.getHttpServer())
        .post(loginPath)
        .send({
          loginOrEmail: incorrectLogin,
          password: defaults.password,
        })
        .expect(401);

      const session = await sessionsTestManager.getSessionByUserId(createdUser.id);
      expect(session.length).toBe(0);
    });
    it('(401) ❌ Shouldn`t login user with incorrect password', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const incorrectPass = 'incorrectPassword';
      await request(app.getHttpServer())
        .post(loginPath)
        .send({
          loginOrEmail: defaults.login,
          password: incorrectPass,
        })
        .expect(401);
      const session = await sessionsTestManager.getSessionByUserId(createdUser.id);
      expect(session.length).toBe(0);
    });
  });

  describe('(/auth/registration) Registration e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(200) ✅ Should registrate user with correct credentials', async () => {
      await request(app.getHttpServer())
        .post(registrationPath)
        .send({
          login: defaults.login,
          email: defaults.email,
          password: defaults.password,
        })
        .expect(204);
    });
    it('(400) ❌ Shouldn`t registrate user with invalid login', async () => {
      const invalidLogin = true;
      const response = await request(app.getHttpServer())
        .post(registrationPath)
        .send({
          login: invalidLogin,
          email: defaults.email,
          password: defaults.password,
        })
        .expect(400);
      expect(response.body.errorsMessages[0].field).toBe('login');
    });
    it('(400) ❌ Shouldn`t registrate user with invalid email and password', async () => {
      await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const invalidEmail = true;
      const invalidPassword = 4;
      const response = await request(app.getHttpServer())
        .post(registrationPath)
        .send({
          login: defaults.login,
          email: invalidEmail,
          password: invalidPassword,
        })
        .expect(400);
      expect(response.body.errorsMessages.length).toBe(2);
      expect(response.body.errorsMessages[0].field).toBe('email');
      expect(response.body.errorsMessages[1].field).toBe('password');
    });
  });

  describe('(/auth/registration-confirmation) Registration-confirmation e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
    });

    it('(204) ✅ Should confirm user with correct input', async () => {
      const registeredUser = await userTestManger.createUserByRegistration();
      console.log(registeredUser);
      await request(app.getHttpServer())
        .post(regConfPath)
        .send({
          code: registeredUser.emailConfirmation.confirmationCode,
        })
        .expect(204);

      const confirmedUser = await userTestManger.findUserById(
        registeredUser.id,
      );
      expect(confirmedUser).not.toBeNull();
      expect(confirmedUser?.emailConfirmation.isConfirmed).toBeTruthy();
    });
    it('(400) ❌ Shouldn`t confirm user with invalid conf code', async () => {
      const invalidConfCode = true;
      const response = await request(app.getHttpServer())
        .post(regConfPath)
        .send({
          code: invalidConfCode,
        })
        .expect(400);
      expect(response.body.errorsMessages[0].field).toBe('code');
    });
    it('(400) ❌ Shouldn`t confirm already confirmed user', async () => {
      const registeredUser = await userTestManger.createUserBySA();
      console.log(registeredUser);
      const response = await request(app.getHttpServer())
        .post(regConfPath)
        .send({
          code: registeredUser.emailConfirmation.confirmationCode,
        })
        .expect(400);
      expect(response.body.errorsMessages[0].field).toBe('code');
    });
  });

  describe('(/auth/registration-email-resending) Registration email resending e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ Should send new code to user with correct credentials', async () => {
      await userTestManger.createUserByRegistration();
      await request(app.getHttpServer())
        .post(regEmailResPath)
        .send({
          email: defaults.email,
        })
        .expect(204);
    });
    it('(400) ❌ Shouldn`t send email to user with invalid email', async () => {
      const invalidLogin = true;
      const response = await request(app.getHttpServer())
        .post(regEmailResPath)
        .send({
          email: invalidLogin,
        })
        .expect(400);
      expect(response.body.errorsMessages[0].field).toBe('email');
    });
    it('(400) ❌ Shouldn`t send email to user with unexisting email', async () => {
      const unexistingEmail = 'someEmail@mail.ru';
      const response = await request(app.getHttpServer())
        .post(regEmailResPath)
        .send({
          email: unexistingEmail,
        })
        .expect(400);
      expect(response.body.errorsMessages[0].field).toBe('email');
    });
    it('(400) ❌ Shouldn`t send email to already confirmed user ', async () => {
      const users = await userTestManger.createUsersBySA(1);
      console.log("users view: ",users);
      const createdUser= await userTestManger.findUserById(+users[0].id)
      console.log(createdUser);
      const response = await request(app.getHttpServer())
        .post(regEmailResPath)
        .send({
          email: users[0].email,
        })
        .expect(400);
      expect(response.body.errorsMessages[0].field).toBe('email');
    });
  });

  describe('(/auth/password-recovery) password recovery e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ Should send email to user for new password', async () => {
      const registeredUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );

      request(app.getHttpServer())
        .post(passRecoveryPath)
        .send({
          email: registeredUser.email,
        })
        .expect(204);
    });
    it('(400) ❌ Shouldn`t send email to user with invalid email', async () => {
      await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );

      const invalidEmail = true;
      const response = await request(app.getHttpServer())
        .post(passRecoveryPath)
        .send({
          email: invalidEmail,
        })
        .expect(400);
      expect(response.body.errorsMessages[0].field).toBe('email');
    });
    it('(204) ❌ Shouldn`t send email to user with unexisting email', async () => {
      await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );

      const invalidEmail = 'anotherUnexistingEmail@mail.ru';
      await request(app.getHttpServer())
        .post(passRecoveryPath)
        .send({
          email: invalidEmail,
        })
        .expect(204);
    });
  });

  describe('(/auth/new-password) new password e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ Should send email to user for new password', async () => {
      const registeredUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const user =
        await userTestManger.setPassRecoveryCodeForUser(registeredUser);
      request(app.getHttpServer())
        .post(newPassPath)
        .send({
          newPassword: defaults.newPassword,
          recoveryCode: user!.passwordRecovery.recoveryCode,
        })
        .expect(204);
    });
    it('(400) ❌ Shouldn`t send email to user with invalid new password', async () => {
      const invalidPassword = true
      const registeredUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const user = await userTestManger.setPassRecoveryCodeForUser(registeredUser);
      const response = await request(app.getHttpServer())
        .post(newPassPath)
        .send({
          newPassword: invalidPassword,
          recoveryCode: user!.passwordRecovery.recoveryCode,
        })
        .expect(400);
      expect(response.body.errorsMessages[0].field).toBe('newPassword');
    });
    it('(400) ❌ Shouldn`t send email to user with invalid recovery code', async () => {
      const invalidCode = mockedRandomServiceReturnedUUId
      const registeredUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      await userTestManger.setPassRecoveryCodeForUser(registeredUser);
      const response = await request(app.getHttpServer())
        .post(newPassPath)
        .send({
          newPassword: defaults.newPassword,
          recoveryCode: invalidCode,
        })
        .expect(400);
      expect(response.body.errorsMessages[0].field).toBe('recoveryCode');
    });
  });

  describe('(/auth/me) me e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(200) ✅ Should get info about user with correct input', async () => {
      await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)

      const response = await request(app.getHttpServer())
        .get(mePath)
        .set('Authorization', "Bearer " + accessToken)
        .expect(200);
      expect(response.body.email).toBe(defaults.email);
      expect(response.body.login).toBe(defaults.login);
      expect(response.body.userId).toEqual(expect.any(String));
    });
    it('(401) ❌ Shouldn`t get info about user with incorrect token', async () => {
      await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      await userTestManger.loginUser(defaults.login, defaults.password)
      const invalidToken = "invalidToken"
      await request(app.getHttpServer())
        .get(mePath)
        .set('Authorization', "Bearer " + invalidToken)
        .expect(401);

    });
  });

  describe('(/auth/refresh-token) Generate new tokens pair e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(200) ✅ Should generate new tokens pair with correct input', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken,refreshToken} = await userTestManger.loginUser(defaults.login, defaults.password)

      await delay(1000)
      const response = await request(app.getHttpServer())
        .post(refreshTokenPath)
        .set('Cookie', "refreshToken=" + refreshToken)
        .expect(200);


      expect(response.body.accessToken).not.toBe(accessToken);
      expect(response.headers['set-cookie'][0].slice(13)).not.toBe(refreshToken);

      const foundSession = await sessionsTestManager.getSessionByUserId(createdUser.id);
      console.log(foundSession);
      expect(foundSession.length).toBe(1)
    });
    it('(401) ❌ Shouldn`t generate new tokens pair with invalid type of refresh token', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken,refreshToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      const invalidRefreshToken = true
      await delay(1000)
      const response = await request(app.getHttpServer())
        .post(refreshTokenPath)
        .set('Cookie', "refreshToken=" + invalidRefreshToken)
        .expect(401);


      const foundSession = await sessionsTestManager.getSessionByUserId(createdUser.id);
      console.log(foundSession);
      expect(foundSession.length).toBe(1)

    });
    it('(401) ❌ Shouldn`t generate new tokens pair with input accessToken', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken,refreshToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      await delay(1000)
      const response = await request(app.getHttpServer())
        .post(refreshTokenPath)
        .set('Cookie', "refreshToken=" + accessToken)
        .expect(401);


      const foundSession = await sessionsTestManager.getSessionByUserId(
        createdUser.id,
      );
      console.log(foundSession);
      expect(foundSession.length).toBe(1)

    });
    it('(401) ❌ Shouldn`t generate new tokens pair with with input refreshToken which not in db', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken,refreshToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      await delay(1000)
      const {deviceId} = await userTestManger.decodeRefreshToken(refreshToken);
      await sessionsTestManager.deleteSpecifiedSession(deviceId)
      const foundSessionAfterDeleting = await sessionsTestManager.getSessionByUserId(createdUser.id);
      expect(foundSessionAfterDeleting.length).toBe(0)

      const response = await request(app.getHttpServer())
        .post(refreshTokenPath)
        .set('Cookie', "refreshToken=" + refreshToken)
        .expect(401);

    });
    it('(401) ❌ Shouldn`t generate new tokens pair which user is deleted', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken,refreshToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      await delay(1000)
      await userTestManger.deleteUserById(createdUser.id);
      const response = await request(app.getHttpServer())
        .post(refreshTokenPath)
        .set('Cookie', "refreshToken=" + refreshToken)
        .expect(401);


      const foundSession = await sessionsTestManager.getSessionByUserId(
        createdUser.id,
      );
      console.log(foundSession);
      expect(foundSession.length).toBe(1)

    });
  });

  describe('(/auth/logout) Logout e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ Should logout with correct input', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken,refreshToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      const foundSessionBeforeDelete = await sessionsTestManager.getSessionByUserId(createdUser.id);
      expect(foundSessionBeforeDelete.length).toBe(1)

      const response = await request(app.getHttpServer())
        .post(logoutPath)
        .set('Cookie', "refreshToken=" + refreshToken)
        .expect(204);
      const foundSessionAfterDelete = await sessionsTestManager.getSessionByUserId(createdUser.id);
      expect(foundSessionAfterDelete.length).toBe(0)

    });
    it('(401) ❌ Shouldn`t logout with incorrect token', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const invalidRefreshToken = true
      const {accessToken,refreshToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      const foundSessionBeforeDelete = await sessionsTestManager.getSessionByUserId(createdUser.id);
      expect(foundSessionBeforeDelete.length).toBe(1)

      const response = await request(app.getHttpServer())
        .post(logoutPath)
        .set('Cookie', "refreshToken=" + invalidRefreshToken)
        .expect(401);
      const foundSessionAfterDelete = await sessionsTestManager.getSessionByUserId(createdUser.id);
      expect(foundSessionAfterDelete.length).toBe(1)

    });
    it('(401) ❌ Shouldn`t logout with input refreshToken which not in db', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken,refreshToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      const foundSessionBeforeDelete = await sessionsTestManager.getSessionByUserId(createdUser.id);
      expect(foundSessionBeforeDelete.length).toBe(1)

      await userTestManger.deleteUserById(createdUser.id);

      const response = await request(app.getHttpServer())
        .post(logoutPath)
        .set('Cookie', "refreshToken=" + refreshToken)
        .expect(401);
      const foundSessionAfterDelete = await sessionsTestManager.getSessionByUserId(createdUser.id);
      expect(foundSessionAfterDelete.length).toBe(1)

    });
  });
});