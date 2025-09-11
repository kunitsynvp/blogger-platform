import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../infrastructure/posts.repository';
import { CreatePostForBlogDto } from '../api/input-dto/create-post-for-blog-dto';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { BlogDocument } from '../../blogs/domain/blog.entity';
import { UpdatePostDomainDto } from '../domain/dto/update-post-domain-dto';
import { InjectModel } from '@nestjs/mongoose';
import type { PostModelType } from '../domain/post.entity';
import { Post } from '../domain/post.entity';
import { CreatePostDomainDto } from '../domain/dto/create-post-domain-dto';
import { UpdatePostDto } from '../api/input-dto/update-post-dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}
  async createPost(dto: CreatePostForBlogDto): Promise<string> {
    const foundBlog: BlogDocument =
      await this.blogsRepository.findBlogsByIdOrFail(dto.blogId);

    const createDto = CreatePostDomainDto.createDto(
      dto.title,
      dto.shortDescription,
      dto.content,
      dto.blogId,
      foundBlog.name,
    );

    const newPost = this.postModel.createPost(createDto);

    const createdPost = await this.postsRepository.save(newPost);

    return createdPost._id.toString();
  }
  async updatePost(id: string, dto: UpdatePostDto): Promise<void> {
    const foundBlog = await this.blogsRepository.findBlogsByIdOrFail(
      dto.blogId,
    );

    const postForUpdate = await this.postsRepository.findPostByIdOrFail(id);

    const updateDto = UpdatePostDomainDto.createDto(
      dto.title,
      dto.shortDescription,
      dto.content,
      dto.blogId,
      foundBlog.name,
    );

    postForUpdate.updatePost(updateDto);

    await this.postsRepository.save(postForUpdate);
  }
  async deletePost(id: string): Promise<void> {
    return await this.postsRepository.deletePost(id);
  }
  // async recalculateLikeStatusesAmount(postId: string,newLikesCount: number, newDislikesCount: number,newestLikes: LikeDetailsViewModel[] | null )
  //   :Promise<boolean> {
  //   const foundPost = await this.postsRepository.findPostById(postId);
  //   if (!foundPost) {
  //     return false
  //   }
  //   foundPost.recalculateLikeStatusesAmount(newLikesCount,newDislikesCount,newestLikes);
  //
  //   await this.postsRepository.save(foundPost)
  //   return true
  // }
}