import { Injectable } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostsViewDto } from '../api/view-dto/posts-view-dto';
import { Post, PostCompoundDbType } from '../domain/post.entity';
import { PostsQueryDto } from '../api/input-dto/posts-query-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { PostLikeConfig } from '../../posts-likes/config/post-likes-config';
import { Blog } from '../../blogs/domain/blog.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post) private posts : Repository<Post>,
    private config: PostLikeConfig,
  ) {}

  async findByIdOrFail(postId: number, userId?: number): Promise<PostsViewDto> {
    // const foundPost: PostCompoundDbType[] = await this.dataSource.query(
    //   `
    //     select
    //       p1.id,
    //       p1.title,
    //       p1."shortDescription",
    //       p1.content,
    //       p1."blogId",
    //       b.name as "blogName",
    //       p1."createdAt",
    //       coalesce((
    //                  select jsonb_agg(
    //                           jsonb_build_object(
    //                             'userId', t."userId",
    //                             'addedAt', t."createdAt",
    //                             'login', t.login
    //                           )
    //                             order by t."createdAt" desc
    //                         ) as newestLikes
    //                  from (
    //                         select pl."userId", pl."createdAt", u.login,pl."postId"
    //                         from "PostLikes" pl
    //                                join "Users" u on u.id = pl."userId"
    //                                join "Posts" p2 on p2.id = pl."postId"
    //                         where "postId" = p1.id and "likeStatus" = 'Like'
    //                         order by pl."createdAt" desc
    //                           limit ${this.config.getExtendedLikesInfoLikesAmount}
    //                       ) t
    //                ),'[]'::jsonb) as "newestLikes",
    //       coalesce((select count(*) from "PostLikes"
    //                 group by "likeStatus", "postId"
    //                 having "likeStatus" = 'Like' and "postId" = p1.id),0) as "likesCount",
    //       coalesce((select count(*) from "PostLikes"
    //                 group by "likeStatus", "postId"
    //                 having "likeStatus" = 'Dislike' and "postId" = p1.id),0) as "dislikesCount",
    //       coalesce((select "likeStatus" from "PostLikes"
    //                 where "postId" = p1.id and "userId" = ${userId ? userId : 0}),'None') as "myStatus"
    //       from "Posts" p1
    //            JOIN "Blogs" b
    //                 on b.id = p1."blogId"
    //       where p1.id = $1
    //   `,
    //   [postId],
    // );
    const whereOptions: FindOptionsWhere<Post>[] = []
    const foundPost = await this.posts
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.blog', 'b')
      .select([
        'p.id as id',
        'p.title as title',
        'p."shortDescription" as "shortDescription"',
        'p.content as content',
        'p."blogId" as "blogId"',
        'b.name as "blogName"',
        'p."createdAt" as "createdAt"',
      ])
      .where('p.id = :postId', { postId: postId })
      .getRawOne()

    if (!foundPost) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Comment not found`,
        field: 'id',
      });
    }
    foundPost.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    }

    return foundPost
  }
  async findAllPosts(
    query: PostsQueryDto,
    blogId?: number,
    userId?: number,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    // let whereOptions = ``;
    // if (blogId) {
    //   whereOptions = `WHERE p1."blogId" = ${blogId}`;
    // }
    //
    // const posts: PostCompoundDbType[] = await this.dataSource.query(
    //   `
    //     select
    //       p1.id,
    //       p1.title,
    //       p1."shortDescription",
    //       p1.content,
    //       p1."blogId",
    //       b.name as "blogName",
    //       p1."createdAt",
    //       coalesce((
    //                  select jsonb_agg(
    //                           jsonb_build_object(
    //                             'userId', t."userId",
    //                             'addedAt', t."createdAt",
    //                             'login', t.login
    //                           )
    //                             order by t."createdAt" desc
    //                         ) as newestLikes
    //                  from (
    //                         select pl."userId", pl."createdAt", u.login,pl."postId"
    //                         from "PostLikes" pl
    //                                join "Users" u on u.id = pl."userId"
    //                                join "Posts" p2 on p2.id = pl."postId"
    //                         where "postId" = p1.id and "likeStatus" = 'Like'
    //                         order by pl."createdAt" desc
    //                           limit ${this.config.getExtendedLikesInfoLikesAmount}
    //                       ) t
    //                ),'[]'::jsonb) as "newestLikes",
    //       coalesce((select count(*) from "PostLikes"
    //                 group by "likeStatus", "postId"
    //                 having "likeStatus" = 'Like' and "postId" = p1.id),0) as "likesCount",
    //       coalesce((select count(*) from "PostLikes"
    //                 group by "likeStatus", "postId"
    //                 having "likeStatus" = 'Dislike' and "postId" = p1.id),0) as "dislikesCount",
    //       coalesce((select "likeStatus" from "PostLikes"
    //                 where "postId" = p1.id and "userId" = ${userId ? userId : 0}),'None') as "myStatus"
    //     from "Posts" p1
    //            JOIN "Blogs" b
    //                 on b.id = p1."blogId"
    //     ${whereOptions}
    //     ORDER BY "${query.sortBy}" ${query.sortDirection}
    //     LIMIT $1
    //     OFFSET $2
    //   `,
    //   [query.pageSize, query.calculateSkip()],
    // );
    // const totalCount: [{ count: string }] = await this.dataSource.query(`
    //     SELECT COUNT(*) FROM "Posts" p1
    //     JOIN "Blogs" b
    //       ON p1."blogId" = b.id
    //     ${whereOptions}
    //   `);
    const whereOptions : FindOptionsWhere<Post>[] = []
    if(blogId){
      whereOptions.push({ blogId : blogId })
    }
    const rawPosts = await this.posts //TODo do normal logic after adding likes
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.blog', 'b')
      .select([
        'p.id as id',
        'p.title as title',
        'p."shortDescription" as "shortDescription"',
        'p.content as content',
        'p."blogId" as "blogId"',
        'b.name as "blogName"',
        'p."createdAt" as "createdAt"',
      ])
      .where(whereOptions)
      .skip(query.calculateSkip())
      .take(query.pageSize)
      .getRawMany();

    const totalCount = await this.posts
      .createQueryBuilder('p')
      .where(whereOptions)
      .getCount();
    const items = rawPosts.map( //TODo do normal logic after adding likes
      p => {
        p.extendedLikesInfo = {
          likesCount: 0,
          dislikesCount: 0,
          newestLikes: [],
        }
      return p
      }
    );

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
      items: items,
    });
  }
}