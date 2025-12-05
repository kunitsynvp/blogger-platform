import { Injectable } from '@nestjs/common';
import {
  Comment,
  CommentQueryDbType,
} from '../domain/comment.entity';
import { CommentsViewDto } from '../api/view-dto/comments-view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommentsQueryDto } from '../api/input-dto/comments-query-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource,
              @InjectRepository(Comment) private comments: Repository<Comment>,) {}
  async findByIdOrFail(
    commentId: number,
    userId?: number,
  ): Promise<CommentsViewDto> {

    const foundComment = await
      this.getCommentQueryBuilder(userId)
          .where('c.id = :commentId', { commentId: commentId })
          .getRawOne<CommentQueryDbType>()

    if (!foundComment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Comment not found`,
        field: 'id',
      });
    }
    return CommentsViewDto.mapToView(foundComment);
  }
  async findAllComments(
    query: CommentsQueryDto,
    postId?: number,
    userId?: number,
  ): Promise<PaginatedViewDto<CommentsViewDto[]>> {
    const whereOptions: FindOptionsWhere<Comment>[] = [];
    if (postId) {
      whereOptions.push({ postId: postId })
    }
    const totalCount = await this.comments
      .createQueryBuilder('c')
      .where(whereOptions)
      .getCount()

    const items  = await this.getCommentQueryBuilder(userId)
      .where(whereOptions)
      .orderBy(`"${query.sortBy}"`, `${query.sortDirection.toUpperCase()}` as "ASC" | "DESC")
      .offset(query.calculateSkip())
      .limit(query.pageSize)
      .getRawMany<CommentQueryDbType>()

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
      items: items.map(CommentsViewDto.mapToView),
    });
  }
  private getCommentQueryBuilder = (userId?: number) => {
    return this.comments
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.user','u')
      .select([
      'c.id as id',
      'c.content as content',
      `json_build_object('userId',u.id,'userLogin',u.login) as "commentatorInfo"`,
      'c."createdAt" as "createdAt"',
    ])
      .addSelect(`
        COALESCE((SELECT count(*) FROM "CommentLikes"
                    GROUP BY status, "commentId"
                    HAVING status = 'Like' and "commentId" = c.id)
                ,0) AS "likesCount"
      `)
      .addSelect(`
        COALESCE((SELECT count(*) FROM "CommentLikes"
                    GROUP BY status, "commentId"
                    HAVING status = 'Dislike' and "commentId" = c.id)
                ,0) AS "dislikesCount"
      ` )
      .addSelect(`
        COALESCE((SELECT status FROM "CommentLikes"
                  WHERE "commentId" = c.id and "userId" = ${userId ? userId : 0}
                  )
           ,'None') AS "myStatus"
      `)
  }
}