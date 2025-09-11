import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreateUserInputDto } from '../../../src/modules/user-accounts/api/input-dto/create-user-dto';
import { UsersViewDto } from '../../../src/modules/user-accounts/api/view-dto/users-view-dto';
import { UserDocument } from '../../../src/modules/user-accounts/domain/user.entity';
import { UsersRepository } from '../../../src/modules/user-accounts/infrastructure/users.repository';
import { CryptoService } from '../../../src/modules/user-accounts/application/crypto.service';
import { UsersService } from '../../../src/modules/user-accounts/application/users.service';

export class UsersTestManager {
  private readonly BasicAuthString: string = 'Basic YWRtaW46cXdlcnR5';

  constructor(private app: INestApplication) {}

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
    const usersRepository = this.app.get<UsersRepository>(UsersRepository);

    await request(this.app.getHttpServer())
      .post('/auth/registration')
      .send(creationData)
      .expect(204);

    const user = await usersRepository.findByLoginOrEmail(creationData.login);
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
  async createUserBySA(dto?: CreateUserInputDto): Promise<UserDocument> {
    const createDto: CreateUserInputDto = {
      login: dto?.login || 'newLogin',
      email: dto?.email || 'newEmail@mail.ru',
      password: dto?.password || 'newPassword',
    };
    const usersService = this.app.get<UsersService>(UsersService);
    const createdUserId = await usersService.createUser(createDto, {
      createBySA: true,
    });
    const createdUser = await usersService.findUserById(createdUserId);
    return createdUser!;
  }
  async setPassRecoveryCodeForUser(user: UserDocument) {
    await request(this.app.getHttpServer())
      .post('/auth/password-recovery')
      .send({
        email: user.email,
      })
      .expect(204);
    const usersRepository = this.app.get<UsersRepository>(UsersRepository);
    return await usersRepository.findById(user._id.toString());
  }

  async createAccessTokenForCurrentUser(
    login: string,
    plainPassword: string,
  ): Promise<{ accessToken: string; user: UserDocument }> {
    const usersRepository = this.app.get<UsersRepository>(UsersRepository);

    const response = await request(this.app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: login,
        password: plainPassword,
      })
      .expect(200);

    const user = await usersRepository.findByLoginOrEmail(login);
    expect(user).not.toBeNull();

    return { accessToken: response.body.accessToken, user: user! };
  }
  async findUserById(userId: string): Promise<UserDocument | null> {
    const usersRepository = this.app.get<UsersRepository>(UsersRepository);
    return usersRepository.findById(userId);
  }
}
