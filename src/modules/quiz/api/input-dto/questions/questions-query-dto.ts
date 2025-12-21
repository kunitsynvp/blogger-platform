import {
  BaseQueryPagination,
  SortDirection,
} from '../../../../../core/dto/base-query-pagination';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { QuestionsSortBy } from './questions-sortBy';
import { QuestionsPublishedStatuses } from './questions-published-statuses';

export class QuestionsQueryDto extends BaseQueryPagination {
  @IsEnum(QuestionsSortBy)
  sortBy = QuestionsSortBy.createdAt;

  @IsOptional()
  @IsString()
  bodySearchTerm: string | null = null;

  @IsEnum(QuestionsPublishedStatuses)
  publishedStatus:QuestionsPublishedStatuses = QuestionsPublishedStatuses.all;

  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.Desc;
}
