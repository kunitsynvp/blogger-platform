import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User, UserDbType } from '../../domain/user/user.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersExternalSqlRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async findByIdOrFail(id: number): Promise<User> {
    const foundUser: UserDbType[] = await this.dataSource.query(
      `
      SELECT * FROM "Users"
      WHERE id = $1
    `,
      [id],
    );

    if (foundUser.length === 0) {
      throw new DomainException({
        message: 'User not found',
        code: DomainExceptionCode.NotFound,
        field: 'userId',
      });
    }
    return plainToInstance(User, foundUser[0]);
  }
}
