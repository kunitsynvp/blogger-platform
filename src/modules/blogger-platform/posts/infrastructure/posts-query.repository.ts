import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import mongoose, { FilterQuery } from 'mongoose';
import { PostsViewDto } from '../api/view-dto/posts-view-dto';
import type { PostModelType } from '../domain/post.entity';
import { Post } from '../domain/post.entity';
import { PostsQueryDto } from '../api/input-dto/posts-query-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { PostLikesQueryRepository } from '../../posts-likes/infrastructure/post-like-query-repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: PostModelType,
    private postsLikesQueryRepository: PostLikesQueryRepository,
  ) {}

  async findByIdOrFail(postId: string, userId?: string): Promise<PostsViewDto> {
    const foundPost = await this.postModel.findById(postId);
    if (!foundPost) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Comment not found`,
        field: 'id',
      });
    }
    const extendedLikesInfo =
      await this.postsLikesQueryRepository.getExtendedLikesInfo({
        postId: postId,
        userId: userId,
      });
    return PostsViewDto.mapToView(foundPost, extendedLikesInfo);
  }
  async findAllPosts(
    query: PostsQueryDto,
    blogId?: string,
    userId?: string,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    const filter: FilterQuery<Comment> = {};

    console.log(query);
    if (blogId) {
      filter.blogId = new mongoose.Types.ObjectId(blogId);
    }

    const posts = await this.postModel
      .find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.postModel.countDocuments(filter);

    const items: PostsViewDto[] = [];
    for (const post of posts) {
      const extendedLikesInfo =
        await this.postsLikesQueryRepository.getExtendedLikesInfo({
          postId: post._id.toString(),
          userId: userId,
        });
      items.push(PostsViewDto.mapToView(post, extendedLikesInfo));
    }

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
      items: items,
    });
  }
}