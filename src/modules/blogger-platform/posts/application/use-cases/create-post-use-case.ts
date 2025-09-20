import { PostsRepository } from '../../infrastructure/posts.repository';
import { CreatePostForBlogDto } from '../../api/input-dto/create-post-for-blog-dto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { BlogDocument } from '../../../blogs/domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import type { PostModelType } from '../../domain/post.entity';
import { Post } from '../../domain/post.entity';
import { CreatePostDomainDto } from '../../domain/dto/create-post-domain-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreatePostCommand {
  constructor(public dto: CreatePostForBlogDto) {
  }
}
@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @InjectModel(Post.name) private postModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}
  async execute(command: CreatePostCommand): Promise<string> {
    const foundBlog: BlogDocument =
      await this.blogsRepository.findBlogsByIdOrFail(command.dto.blogId);

    const createDto = CreatePostDomainDto.createDto(
      command.dto.title,
      command.dto.shortDescription,
      command.dto.content,
      command.dto.blogId,
      foundBlog.name,
    );

    const newPost = this.postModel.createPost(createDto);

    const createdPost = await this.postsRepository.save(newPost);

    return createdPost._id.toString();
  }
}