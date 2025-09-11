import { Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import mongoose, { FilterQuery } from 'mongoose';
import { PostsViewDto } from '../api/view-dto/posts-view-dto';
import { Post } from '../domain/post.entity';
import { PostsQueryDto } from '../api/input-dto/posts-query-dto';
import type {PostModelType } from '../domain/post.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: PostModelType) {}

  async findByIdOrFail(postId: string): Promise<PostsViewDto> {
    const foundPost = await this.postModel.findById(postId);
    if (!foundPost) {
      throw new NotFoundException(`Comment not found`);
    }
    return PostsViewDto.mapToView(foundPost);
  }
  async findAllPosts(
    query: PostsQueryDto,
    blogId?: string,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    const filter: FilterQuery<Comment> = {};

    if (blogId) {
      filter.blogId = new mongoose.Types.ObjectId(blogId);
    }

    const posts = await this.postModel
      .find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.postModel.countDocuments(filter);

    const items = posts.map(PostsViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount: totalCount,
      items: items,
    });
  }
}