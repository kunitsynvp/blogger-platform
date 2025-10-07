import { CreatePostForBlogDto } from '../../api/input-dto/create-post-for-blog-dto';
import { Post } from '../../domain/post.entity';
import { CreatePostDomainDto } from '../../domain/dto/create-post-domain-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../../blogs/infrastructure/blogs.sql.repository';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';

export class CreatePostCommand {
  constructor(public dto: CreatePostForBlogDto) {}
}
@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private postsRepository: PostsSqlRepository,
    private blogsRepository: BlogsSqlRepository,
  ) {}
  async execute(command: CreatePostCommand): Promise<number> {
    await this.blogsRepository.findBlogByIdOrFail(command.dto.blogId);

    const createDto = CreatePostDomainDto.createDto(
      command.dto.title,
      command.dto.shortDescription,
      command.dto.content,
      command.dto.blogId,
    );

    const newPost = Post.createPost(createDto);

    const createdPostId = await this.postsRepository.createPost(newPost);

    return createdPostId;
  }
}