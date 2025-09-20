import { BaseQueryPagination } from '../../../../../core/dto/base-query-pagination';
import { PostsSortBy } from './posts-sort-by';
import { IsEnum } from 'class-validator';

export class PostsQueryDto extends BaseQueryPagination {
  @IsEnum(PostsSortBy)
  sortBy = PostsSortBy.createdAt;
}
