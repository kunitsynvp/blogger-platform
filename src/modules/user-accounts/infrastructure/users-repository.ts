import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { User } from '../domain/user/user.entity';
import { EmailConfirmation } from '../domain/user/email-confirmation.entity';
import { PasswordRecovery } from '../domain/user/password-recovery.entity';
import { Session } from '../domain/sessions/session.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(User)
    protected users: Repository<User>,
    @InjectRepository(EmailConfirmation)
    protected emailConfirmations: Repository<EmailConfirmation>,
    @InjectRepository(PasswordRecovery)
    protected passwordRecoveries: Repository<PasswordRecovery>,
    @InjectRepository(Session)
    protected sessions: Repository<Session>,
  ) {}
  async save(user: User): Promise<User> {
    return await this.users.save(user);
  }

  async findByIdOrFail(id: number): Promise<User> {
    const foundUser = await this.users.findOneBy({ id: id });
    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        field: 'none',
      });
    }
    return foundUser;
  }
  async findById(id: number): Promise<User | null> {
    return await this.users.findOneBy({ id: id });
  }
  async findByIdOrUnauthorizedFail(id: number): Promise<User> {
    const foundUser = await this.users.findOneBy({ id: id });
    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
        field: 'None',
      });
    }
    return foundUser;
  }

  async findByLogin(login: string): Promise<User | null> {
    return await this.users.findOneBy({ login: login });
  }
  async findByEmail(email: string): Promise<User | null> {
    return await this.users.findOneBy({ email: email });
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    const foundUser = await this.users.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    return foundUser;
  }

  async deleteOrFail(id: number): Promise<void> {
    const foundUser = await this.users.findOneBy({ id: id });
    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        field: 'none',
      });
    }
    await this.emailConfirmations.delete({ userId: id });
    await this.passwordRecoveries.delete({ userId: id });
    await this.sessions.delete({ userId: id });
    await this.dataSource.query(
      //TODO remove raw sql after creating blogs, posts .... entities
      `
      DELETE FROM "CommentLikes"
      WHERE "userId" = $1
    `,
      [id],
    );
    await this.dataSource.query(
      `
      DELETE FROM "PostLikes"
      WHERE "userId" = $1
    `,
      [id],
    );
    await this.dataSource.query(
      `
      DELETE FROM "Comments"
      WHERE "userId" = $1
    `,
      [id],
    );
    await this.users.delete({ id: id });
  }
}
