import { UsersViewDto } from '../../../api/view-dto/users-view-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../../infrastructure/users.query.repository';

export class GetUserByIdOrFailQuery {
  constructor(public id: number) {}
}
@QueryHandler(GetUserByIdOrFailQuery)
export class GetUserByIdAndFailQueryHandler implements IQueryHandler<
  GetUserByIdOrFailQuery,
  UsersViewDto>
{
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async execute(query: GetUserByIdOrFailQuery): Promise<UsersViewDto> {
    return await this.usersQueryRepository.findByIdOrFail(query.id);
  }
}