import {
  BaseQueryPagination,
  SortDirection,
} from '../../../../core/dto/base-query-pagination';
import { UsersSortBy } from './users-sort-by';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UsersQueryDto extends BaseQueryPagination {
  @IsEnum(UsersSortBy)
  sortBy = UsersSortBy.CreatedAt;

  @IsOptional()
  @IsString()
  searchLoginTerm: string | null = null;

  @IsOptional()
  @IsString()
  searchEmailTerm: string | null = null;

  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.Desc;
}
