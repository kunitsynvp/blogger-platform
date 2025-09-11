import { CommentsSortBy } from './comments-sort-by';
import { BaseQueryPagination } from '../../../../../core/dto/base-query-pagination';
import { IsEnum } from 'class-validator';

export class CommentsQueryDto extends BaseQueryPagination {
  @IsEnum(CommentsSortBy)
  sortBy = CommentsSortBy.createdAt;
}
