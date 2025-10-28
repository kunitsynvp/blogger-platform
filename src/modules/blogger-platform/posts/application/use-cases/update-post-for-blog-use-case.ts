import { UpdatePostDomainDto } from '../../domain/dto/update-post-domain-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts-repository';
import { UpdatePostForBlogCommandDto } from '../dto/update-post-for-blog-command-dto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class UpdatePostForBlogCommand {
  constructor(public dto: UpdatePostForBlogCommandDto) {}
}
@CommandHandler(UpdatePostForBlogCommand)
export class UpdatePostForBlogUseCase
  implements ICommandHandler<UpdatePostForBlogCommand>
{
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute(command: UpdatePostForBlogCommand): Promise<void> {
    await this.blogsRepository.findBlogByIdOrFail(command.dto.blogId);

    const postForUpdate = await this.postsRepository.findPostByIdOrFail(
      command.dto.postId,
    );

    const updateDto = UpdatePostDomainDto.createDto(
      command.dto.title,
      command.dto.shortDescription,
      command.dto.content,
      command.dto.blogId,
    );

    postForUpdate.updatePost(updateDto);

    await this.postsRepository.save(postForUpdate);
  }
}