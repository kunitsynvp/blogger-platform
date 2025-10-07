import { Injectable } from '@nestjs/common';
import { UsersQueryDto } from '../api/input-dto/users-query-dto';
import { UsersViewDto } from '../api/view-dto/users-view-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { MeViewDto } from '../api/view-dto/me-view-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { User, UserDbType } from '../domain/user/user.entity';

@Injectable()
export class UsersSqlQueryRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}
  async findAllUsers(
    query: UsersQueryDto,
  ): Promise<PaginatedViewDto<UsersViewDto[]>> {
    const whereOptions: string[] = [];
    if (query.searchLoginTerm) {
      whereOptions.push(`(login ILIKE '%${query.searchLoginTerm}%')`);
    }
    if (query.searchEmailTerm) {
      whereOptions.push(`(email ILIKE '%${query.searchEmailTerm}%')`);
    }
    let sqlRequest = `SELECT * FROM "Users" 
      ${whereOptions.length ? `WHERE ${whereOptions.join(' OR ')}` : ''}
      ORDER BY "${query.sortBy}" ${query.sortDirection.toUpperCase()} 
      LIMIT $1 
      OFFSET $2`;
    let countRequest = `SELECT COUNT(*) FROM "Users"  
                               ${whereOptions.length ? `WHERE ${whereOptions.join(' OR ')}` : ''} `;

    const offset = query.calculateSkip();

    const users: UserDbType[] = await this.dataSource.query(sqlRequest, [
      query.pageSize,
      offset,
    ]);
    const userInstances = plainToInstance(User, users);

    const totalCount: [{ count: string }] =
      await this.dataSource.query(countRequest);

    const items = userInstances.map(UsersViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: +totalCount[0].count,
      items,
    });
  }
  async findByIdOrFail(id: number): Promise<UsersViewDto> {
    const foundUser: UserDbType[] = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE id = $1`,
      [id],
    );

    if (foundUser.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        field: 'id',
      });
    }
    const instanceUser = plainToInstance(User, foundUser[0]);
    return UsersViewDto.mapToView(instanceUser);
  }
  async me(id: string): Promise<MeViewDto> {
    const foundUser: UserDbType[] = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE id = $1`,
      [id],
    );
    if (foundUser.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        field: 'id',
      });
    }
    const instanceUser = plainToInstance(User, foundUser[0]);
    return MeViewDto.mapToView(instanceUser);
  }
}
