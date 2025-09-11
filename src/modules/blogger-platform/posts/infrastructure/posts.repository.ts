import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument} from '../domain/post.entity';
import type { PostModelType } from '../domain/post.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: PostModelType) {}
  async save(post: PostDocument): Promise<PostDocument>{
    return await post.save();
  }
  async findPostByIdOrFail(postId: string): Promise<PostDocument> {
    const foundPost = await this.postModel.findById(postId)
    if (!foundPost) {
      throw new NotFoundException(`post not found`);
    }
    return foundPost
  }

  async deletePost(id: string): Promise<void> {
    const deletedResult = await this.postModel.findByIdAndDelete(id)
    if(!deletedResult) {
      throw new NotFoundException(`post not found`);
    }
  }
}