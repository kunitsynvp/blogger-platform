import { Injectable } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostsViewDto } from '../api/view-dto/posts-view-dto';
import { PostCompoundDbType } from '../domain/post.entity';
import { PostsQueryDto } from '../api/input-dto/posts-query-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostLikeConfig } from '../../posts-likes/config/post-likes-config';

@Injectable()
export class PostsSqlQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private config: PostLikeConfig,
  ) {}

  async findByIdOrFail(postId: number, userId?: number): Promise<PostsViewDto> {
    const foundPost: PostCompoundDbType[] = await this.dataSource.query(
      `
        select
          p1.id,
          p1.title,
          p1."shortDescription",
          p1.content,
          p1."blogId",
          b.name as "blogName",
          p1."createdAt",
          coalesce((
                     select jsonb_agg(
                              jsonb_build_object(
                                'userId', t."userId",
                                'addedAt', t."createdAt",
                                'login', t.login
                              )
                                order by t."createdAt" desc
                            ) as newestLikes
                     from (
                            select pl."userId", pl."createdAt", u.login,pl."postId"
                            from "PostLikes" pl
                                   join "Users" u on u.id = pl."userId"
                                   join "Posts" p2 on p2.id = pl."postId"
                            where "postId" = p1.id and "likeStatus" = 'Like'
                            order by pl."createdAt" desc
                              limit ${this.config.getExtendedLikesInfoLikesAmount}
                          ) t
                   ),'[]'::jsonb) as "newestLikes",
          coalesce((select count(*) from "PostLikes"
                    group by "likeStatus", "postId"
                    having "likeStatus" = 'Like' and "postId" = p1.id),0) as "likesCount",
          coalesce((select count(*) from "PostLikes"
                    group by "likeStatus", "postId"
                    having "likeStatus" = 'Dislike' and "postId" = p1.id),0) as "dislikesCount",
          coalesce((select "likeStatus" from "PostLikes"
                    where "postId" = p1.id and "userId" = ${userId ? userId : 0}),'None') as "myStatus"
          from "Posts" p1
               JOIN "Blogs" b
                    on b.id = p1."blogId"
          where p1.id = $1
      `,
      [postId],
    );
    if (foundPost.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Comment not found`,
        field: 'id',
      });
    }

    return PostsViewDto.mapToView(foundPost[0]);
  }
  async findAllPosts(
    query: PostsQueryDto,
    blogId?: number,
    userId?: number,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    let whereOptions = ``;
    if (blogId) {
      whereOptions = `WHERE p1."blogId" = ${blogId}`;
    }

    const posts: PostCompoundDbType[] = await this.dataSource.query(
      `
        select
          p1.id,
          p1.title,
          p1."shortDescription",
          p1.content,
          p1."blogId",
          b.name as "blogName",
          p1."createdAt",
          coalesce((
                     select jsonb_agg(
                              jsonb_build_object(
                                'userId', t."userId",
                                'addedAt', t."createdAt",
                                'login', t.login
                              )
                                order by t."createdAt" desc
                            ) as newestLikes
                     from (
                            select pl."userId", pl."createdAt", u.login,pl."postId"
                            from "PostLikes" pl
                                   join "Users" u on u.id = pl."userId"
                                   join "Posts" p2 on p2.id = pl."postId"
                            where "postId" = p1.id and "likeStatus" = 'Like'
                            order by pl."createdAt" desc
                              limit ${this.config.getExtendedLikesInfoLikesAmount}
                          ) t
                   ),'[]'::jsonb) as "newestLikes",
          coalesce((select count(*) from "PostLikes"
                    group by "likeStatus", "postId"
                    having "likeStatus" = 'Like' and "postId" = p1.id),0) as "likesCount",
          coalesce((select count(*) from "PostLikes"
                    group by "likeStatus", "postId"
                    having "likeStatus" = 'Dislike' and "postId" = p1.id),0) as "dislikesCount",
          coalesce((select "likeStatus" from "PostLikes"
                    where "postId" = p1.id and "userId" = ${userId ? userId : 0}),'None') as "myStatus"
        from "Posts" p1
               JOIN "Blogs" b
                    on b.id = p1."blogId"
        ${whereOptions}
        ORDER BY "${query.sortBy}" ${query.sortDirection}
        LIMIT $1
        OFFSET $2
      `,
      [query.pageSize, query.calculateSkip()],
    );
    const totalCount: [{ count: string }] = await this.dataSource.query(`
        SELECT COUNT(*) FROM "Posts" p1
        JOIN "Blogs" b
          ON p1."blogId" = b.id 
        ${whereOptions}
      `);

    const items = posts.map(PostsViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: +totalCount[0].count,
      items: items,
    });
  }
}