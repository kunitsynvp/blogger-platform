import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import type { PostModelType } from '../../domain/post.entity';
import { Post } from '../../domain/post.entity';

@Injectable()
export class RecalculateLikesUseCase {
  constructor(
    @InjectModel(Post.name) private postModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async recalculateLikeStatusesAmount(
    postId, //TODO Normal DTO
  ): Promise<void> {
    const foundPost = await this.postsRepository.findPostByIdOrFail(postId);

    //TODO: Logic for calculating likes
    //foundPost.recalculateLikeStatusesAmount(newLikesCount,newDislikesCount,newestLikes);

    await this.postsRepository.save(foundPost);
  }
}