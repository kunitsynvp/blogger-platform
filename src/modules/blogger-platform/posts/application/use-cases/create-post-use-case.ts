import { CreatePostForBlogDto } from '../../api/input-dto/create-post-for-blog-dto';
import { Post } from '../../domain/post.entity';
import { CreatePostDomainDto } from '../../domain/dto/create-post-domain-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BlogsRepository,
} from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/posts-repository';

export class CreatePostCommand {
  constructor(public dto: CreatePostForBlogDto) {}
}
@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
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

    const createdPost = await this.postsRepository.save(newPost);
    console.log("createdPost:" ,createdPost);

    return createdPost.id;
  }
}