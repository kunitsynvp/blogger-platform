import { Injectable } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostsViewDto } from '../api/view-dto/posts-view-dto';
import { Post } from '../domain/post.entity';
import { PostsQueryDto } from '../api/input-dto/posts-query-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { PostLikeConfig } from '../../posts-likes/config/post-likes-config';
import { LikeStatus } from '../../comments/domain/enums/like-status-enum';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post) private posts: Repository<Post>,
    private config: PostLikeConfig,
  ) {}

  async findByIdOrFail(postId: number, userId?: number): Promise<PostsViewDto> {

    const foundPost = await this.getPostsSelectQueryBuilder(userId)
      .where('p.id = :postId', { postId: postId })
      .getRawOne<PostQueryDbType>();

    if (!foundPost) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Post not found`,
        field: 'id',
      });
    }

    return PostsViewDto.mapToView(foundPost);
  }
  async findAllPosts(
    query: PostsQueryDto,
    blogId?: number,
    userId?: number,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {

    const whereOptions: FindOptionsWhere<Post>[] = [];
    if (blogId) {
      whereOptions.push({ blogId: blogId });
    }
    const items = await this.getPostsSelectQueryBuilder(userId)
      .where(whereOptions)
      .orderBy(`"${query.sortBy}"`, `${query.sortDirection.toUpperCase()}` as "ASC" | "DESC" )
      .offset(query.calculateSkip())
      .limit(query.pageSize)
      .getRawMany<PostQueryDbType>();

    const totalCount = await this.posts
      .createQueryBuilder('p')
      .where(whereOptions)
      .getCount();

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
      items: items.map(PostsViewDto.mapToView),
    });
  }
  private getPostsSelectQueryBuilder = (userId? : number) => {
    return this.posts
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.blog', 'b')
      .select([
        'p.id as id',
        'p.title as title',
        'p."shortDescription" as "shortDescription"',
        'p.content as content',
        'p."blogId" as "blogId"',
        'b.name as "blogName"',
        'p."createdAt" as "createdAt"'
      ])
      .addSelect(`
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
                 where "postId" = p.id and "likeStatus" = 'Like'
                 order by pl."createdAt" desc
                 limit ${this.config.getExtendedLikesInfoLikesAmount}
              ) t
        ),'[]'::jsonb) as "newestLikes"
      `)
      .addSelect(`
        coalesce((select count(*) from "PostLikes"
                    group by "likeStatus", "postId"
                    having "likeStatus" = 'Like' and "postId" = p.id)
                 ,0) as "likesCount"
      `)
      .addSelect(`
        coalesce((select count(*) from "PostLikes"
                    group by "likeStatus", "postId"
                    having "likeStatus" = 'Dislike' and "postId" = p.id)
                 ,0) as "dislikesCount"
      `)
      .addSelect(`
        coalesce((select "likeStatus" from "PostLikes"
                    where "postId" = p.id and "userId" = ${userId ? userId : 0})
                 ,'None') as "myStatus"
      `)
  }
}
export type PostQueryDbType = {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  newestLikes: {
    userId: number;
    login: string;
    addedAt: string;
  }[]
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};