import { BaseQueryPagination } from '../../../../../core/dto/base-query-pagination';
import { BlogsSortBy } from './blogs-sort-by';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class BlogsQueryDto extends BaseQueryPagination {
  @IsEnum(BlogsSortBy)
  sortBy = BlogsSortBy.CreatedAt;

  @IsOptional()
  @IsString()
  searchNameTerm: string | null = null;
}