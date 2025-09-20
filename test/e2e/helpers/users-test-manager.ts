import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreateUserInputDto } from '../../../src/modules/user-accounts/api/input-dto/create-user-dto';
import { UsersViewDto } from '../../../src/modules/user-accounts/api/view-dto/users-view-dto';
import { UserDocument } from '../../../src/modules/user-accounts/domain/user.entity';
import { UsersRepository } from '../../../src/modules/user-accounts/infrastructure/users.repository';
import { CreateUserCommand } from '../../../src/modules/user-accounts/application/use-cases/users/create-user-use-case';
import { CommandBus } from '@nestjs/cqrs';


export class UsersTestManager {
  private readonly BasicAuthString: string = 'Basic YWRtaW46cXdlcnR5';

  private usersRepository: UsersRepository;
  private commandBus: CommandBus;

  constructor(private app: INestApplication) {
    this.usersRepository = this.app.get<UsersRepository>(UsersRepository);
    this.commandBus = this.app.get<CommandBus>(CommandBus);
  }
  async createUserByRegistration(
    login?: string,
    password?: string,
    email?: string,
  ): Promise<UserDocument> {
    const creationData: CreateUserInputDto = {
      login: login ?? 'newLogin1',
      password: password ?? 'newPassword',
      email: email ?? 'newEmail@mail.ru',
    };

    await request(this.app.getHttpServer())
      .post('/auth/registration')
      .send(creationData)
      .expect(204);

    const user = await this.usersRepository.findByLoginOrEmail(
      creationData.login,
    );
    expect(user).not.toBeNull();
    expect(user?.login).toBe(creationData.login);
    expect(user?.email).toBe(creationData.email);

    return user!;
  }
  async createUsersBySA(count: number): Promise<UsersViewDto[]> {
    const users = [] as UsersViewDto[];
    for (let i = 0; i < count; i++) {
      const res = await request(this.app.getHttpServer())
        .post('/users')
        .set('Authorization', this.BasicAuthString)
        .send({
          login: `newLogin${i}`,
          password: `newPassword${i}`,
          email: `newEmail${i}@gmail.com`,
        })
        .expect(201);
      users.push(res.body);
    }
    return users;
  }
  async createUsersBySAAndLogin(count: number): Promise<{users: UsersViewDto[], accessTokens: string[]}> {
    const users = [] as UsersViewDto[];
    const accessTokens = [] as string[];
    for (let i = 0; i < count; i++) {
      let login = `newLogin${i}`;
      let password = `newPassword${i}`;
      let email = `newEmail${i}@gmail.com`;
      const createUserResponse = await request(this.app.getHttpServer())
        .post('/users')
        .set('Authorization', this.BasicAuthString)
        .send({
          login: login,
          password: password,
          email: email,
        })
        .expect(201);
      users.push(createUserResponse.body);
      const loginResponse = await this.loginUser(login,password)
      accessTokens.push(loginResponse.accessToken);
    }

    return {users: users, accessTokens: accessTokens };
  }
  async createUserBySA(dto?: CreateUserInputDto): Promise<UserDocument> {
    const createDto: CreateUserInputDto = {
      login: dto?.login || 'newLogin',
      email: dto?.email || 'newEmail@mail.ru',
      password: dto?.password || 'newPassword',
    };

    const createdUserId = await this.commandBus.execute(
      new CreateUserCommand(createDto, {
        createBySA: true,
      }),
    );
    const createdUser = await this.usersRepository.findById(createdUserId);
    return createdUser!;
  }
  async setPassRecoveryCodeForUser(user: UserDocument) {
    await request(this.app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: user.email,
      })
      .expect(204);
    return await this.usersRepository.findById(user._id.toString());
  }

  async loginUser(
    login: string,
    plainPassword: string,
  ): Promise<{ accessToken: string; user: UserDocument }> {
    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: login,
        password: plainPassword,
      })
      .expect(200);

    const user = await this.usersRepository.findByLoginOrEmail(login);
    expect(user).not.toBeNull();

    return { accessToken: response.body.accessToken, user: user! };
  }
  async findUserById(userId: string): Promise<UserDocument | null> {
    return await this.usersRepository.findById(userId);
  }
  async createSeveralAccessAndRefreshTokensWithSeveralUsers(
    amount = 1,
  ): Promise<{
    accessTokens: Array<string>;
    refreshTokens: Array<string>;
    users: UserDocument[];
  }> {
    let createdUser: UserDocument;
    let login;
    let password;
    let email;
    const accessTokensArray: Array<string> = [];
    const refreshTokensArray = [];
    const users: UserDocument[] = [];
    for (let i = 0; i < amount; i++) {
      login = `login${i}`;
      password = `password${i}`;
      email = `email${i}@mail.ru`;

      createdUser = await this.createUserByRegistration(login, password, email);

      const { accessToken } = await this.loginUser(login, password);

      accessTokensArray.push(accessToken);
      //refreshTokensArray.push(tokens.refreshToken)
      users.push(createdUser);

      //sessions logic
      // const dataFromJWT = await this.jwtService.decode(token)
      //
      // const dto: CreateSessionDTO = {
      //   ip: "127.0.0.1",
      //   title: "some device name${i}",
      //   deviceId: dataFromJWT.deviceId,
      //   userId: dataFromJWT.userId,
      //   iat: dataFromJWT.iat,
      //   exp: dataFromJWT.exp,
      // }
      // const res = await securityDevicesService.createSession(dto)
      // expect(res).not.toBeNull()
      // expect(res).toBeDefined()
    }

    return {
      accessTokens: accessTokensArray,
      refreshTokens: refreshTokensArray,
      users: users,
    };
  }
}
