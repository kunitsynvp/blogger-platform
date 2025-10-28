import { Injectable } from '@nestjs/common';
import { UsersQueryDto } from '../api/input-dto/users-query-dto';
import { UsersViewDto } from '../api/view-dto/users-view-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { MeViewDto } from '../api/view-dto/me-view-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { User } from '../domain/user/user.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectRepository(User) protected users: Repository<User>) {}
  async findAllUsers(
    query: UsersQueryDto,
  ): Promise<PaginatedViewDto<UsersViewDto[]>> {
    const whereOptions: FindOptionsWhere<User>[] = [];
    if (query.searchLoginTerm) {
      whereOptions.push({ login: ILike(`%${query.searchLoginTerm}%`) });
    }
    if (query.searchEmailTerm) {
      whereOptions.push({ email: ILike(`%${query.searchEmailTerm}%`) });
    }

    const sortDirection = query.sortDirection.toUpperCase() as 'ASC' | 'DESC';

    const items= await this.users
      .createQueryBuilder('u')
      .select([
        'u.id as id',
        'u.login as login',
        'u.email as email',
        'u."createdAt" as "createdAt"'])
      .where(whereOptions)
      .orderBy(`"${query.sortBy}"`,`${sortDirection}`)
      .take(query.pageSize)
      .skip(query.calculateSkip())
      .getRawMany<UsersViewDto>()

    const totalCount= await this.users
      .createQueryBuilder('u')
      .where(whereOptions)
      .getCount()

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
      items: items,
    });
  }
  async findByIdOrFail(id: number): Promise<UsersViewDto> {
    const foundUser = await this.users
      .createQueryBuilder('u')
      .select([
        'u.id as id',
        'u.login as login',
        'u.email as email',
        'u."createdAt" as "createdAt"'
      ])
      .where('u.id = :userId', { userId: id })
      .getRawOne<UsersViewDto>()

    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        field: 'id',
      });
    }
    return foundUser
  }
  async me(id: number): Promise<MeViewDto> {
    const foundUser: MeViewDto | undefined = await this.users
      .createQueryBuilder('u')
      .select(['u.id as "userId"', 'u.login as login', 'u.email as email'])
      .where('u.id = :id', { id: id })
      .getRawOne();
    if (!foundUser) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        field: 'id',
      });
    }
    return foundUser;
  }
}
