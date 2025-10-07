import { Injectable } from '@nestjs/common';
import { CommentCompoundDbType } from '../domain/comment.entity';
import { CommentsViewDto } from '../api/view-dto/comments-view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommentsQueryDto } from '../api/input-dto/comments-query-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsSqlQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async findByIdOrFail(
    commentId: number,
    userId?: number,
  ): Promise<CommentsViewDto> {
    const foundComment: CommentCompoundDbType[] = await this.dataSource.query(
      `
        SELECT
          c.id,
          c.content,
          c."userId",
          u.login as "userLogin",
          c."createdAt",
          COALESCE((SELECT count(*) FROM "CommentLikes"
                    GROUP BY "likeStatus", "commentId"
                    HAVING "likeStatus" = 'Like' and "commentId" = c.id)
          ,0) as "likesCount",
          COALESCE((SELECT count(*) FROM "CommentLikes"
                    GROUP BY "likeStatus", "commentId"
                    HAVING "likeStatus" = 'Dislike' and "commentId" = c.id)
          ,0) as "dislikesCount",
          COALESCE((SELECT "likeStatus" FROM "CommentLikes"
                    WHERE "commentId" = c.id and "userId" = ${userId ? userId : 0}
                   )
        ,'None') as "myStatus"
        FROM "Comments" c
        JOIN "Users" u
            ON c."userId" = u.id
        WHERE c.id = $1
      `,
      [commentId],
    );

    if (foundComment.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Comment not found`,
        field: 'id',
      });
    }
    return CommentsViewDto.mapToView(foundComment[0]);
  }
  async findAllComments(
    query: CommentsQueryDto,
    postId?: number,
    userId?: number,
  ): Promise<PaginatedViewDto<CommentsViewDto[]>> {
    let whereOptions = ``;
    if (postId) {
      whereOptions = `WHERE "postId" = ${postId}`;
    }
    const comments: CommentCompoundDbType[] = await this.dataSource.query(
      `
      SELECT
        c.id,
        c.content,
        c."userId",
        u.login as "userLogin",
        c."createdAt",
        COALESCE((SELECT count(*) FROM "CommentLikes"
                  GROUP BY "likeStatus", "commentId"
                 HAVING "likeStatus" = 'Like' and "commentId" = c.id)
          ,0) as "likesCount",
        COALESCE((SELECT count(*) FROM "CommentLikes"
                  GROUP BY "likeStatus", "commentId"
                  HAVING "likeStatus" = 'Dislike' and "commentId" = c.id)
          ,0) as "dislikesCount",
        COALESCE((SELECT "likeStatus" FROM "CommentLikes"
                  WHERE "commentId" = c.id and "userId" = ${userId ? userId : 0}
                 )
          ,'None') as "myStatus"
      FROM "Comments" c
             JOIN "Users" u
                  ON c."userId" = u.id
      ${whereOptions}
      ORDER BY "${query.sortBy}" ${query.sortDirection.toUpperCase()}
      LIMIT $1
      OFFSET $2
    `,
      [query.pageSize, query.calculateSkip()],
    );

    const totalCount: [{ count: string }] = await this.dataSource.query(`
      SELECT COUNT(*) FROM "Comments"    
      ${whereOptions}
    `);

    const items = comments.map(CommentsViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: +totalCount[0].count,
      items: items,
    });
  }
}