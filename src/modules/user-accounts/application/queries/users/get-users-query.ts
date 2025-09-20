import { UsersViewDto } from '../../../api/view-dto/users-view-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../../infrastructure/users.query.repository';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { UsersQueryDto } from '../../../api/input-dto/users-query-dto';

export class GetUsersQuery {
  constructor(public queryParams: UsersQueryDto) {}
}
@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler
  implements IQueryHandler<GetUsersQuery, PaginatedViewDto<UsersViewDto[]>>
{
  constructor(private usersQueryRepository: UsersQueryRepository) {}
  async execute(query: GetUsersQuery): Promise<PaginatedViewDto<UsersViewDto[]>> {
    return await this.usersQueryRepository.findAllUsers(query.queryParams);
  }
}