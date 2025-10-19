import { Injectable } from '@nestjs/common';
import { UsersQueryDto } from '../api/input-dto/users-query-dto';
import { UsersViewDto } from '../api/view-dto/users-view-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { MeViewDto } from '../api/view-dto/me-view-dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { User, UserDbType } from '../domain/user/user.entity';
import { DataSource, FindOptionsWhere, ILike, Repository } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,

    @InjectRepository(User) protected users: Repository<User>
  ) {}
  async findAllUsers(
    query: UsersQueryDto,
  ): Promise<PaginatedViewDto<UsersViewDto[]>> {
     const whereOptions: FindOptionsWhere<User>[] = [];
    if (query.searchLoginTerm) {
      whereOptions.push({login: ILike(`%${query.searchLoginTerm}%`)});
    }
    if (query.searchEmailTerm) {
      whereOptions.push({email: ILike(`%${query.searchEmailTerm}%`)});
    }

    const [ items, totalCount] = await this.users.findAndCount({
      where: whereOptions,
      order: { [query.sortBy]:query.sortDirection },
      skip: query.calculateSkip(),
      take: query.pageSize,
    })

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
      items: items.map(UsersViewDto.mapToView),
    });
  }
  async findByIdOrFail(id: number): Promise<UsersViewDto> {
    const foundUser = await this.users.findOneBy({ id: id });

    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        field: 'id',
      });
    }
    return UsersViewDto.mapToView(foundUser);
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
