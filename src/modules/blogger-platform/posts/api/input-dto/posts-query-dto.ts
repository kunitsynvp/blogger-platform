import { BaseQueryPagination } from '../../../../../core/dto/base-query-pagination';
import { PostsSortBy } from './posts-sort-by';

export class PostsQueryDto extends BaseQueryPagination {
  sortBy = PostsSortBy.createdAt;
}
