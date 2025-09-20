import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { PostModelType } from '../domain/post.entity';
import { Post, PostDocument } from '../domain/post.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: PostModelType) {}
  async save(post: PostDocument): Promise<PostDocument> {
    return await post.save();
  }
  async findPostByIdOrFail(postId: string): Promise<PostDocument> {
    const foundPost = await this.postModel.findById(postId);
    if (!foundPost) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `post not found`,
        field: 'id',
      });
    }
    return foundPost;
  }

  async deletePost(id: string): Promise<void> {
    const deletedResult = await this.postModel.findByIdAndDelete(id);
    if (!deletedResult) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `post not found`,
        field: 'id',
      });
    }
  }
}