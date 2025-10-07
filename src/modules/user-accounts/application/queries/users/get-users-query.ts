import { UsersViewDto } from '../../../api/view-dto/users-view-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { UsersQueryDto } from '../../../api/input-dto/users-query-dto';
import { UsersSqlQueryRepository } from '../../../infrastructure/users.sql.query.repository';

export class GetUsersQuery {
  constructor(public queryParams: UsersQueryDto) {}
}
@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler
  implements IQueryHandler<GetUsersQuery, PaginatedViewDto<UsersViewDto[]>>
{
  constructor(private usersQueryRepository: UsersSqlQueryRepository) {}
  async execute(query: GetUsersQuery): Promise<PaginatedViewDto<UsersViewDto[]>> {
    return await this.usersQueryRepository.findAllUsers(query.queryParams);
  }
}