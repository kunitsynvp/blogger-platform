import { UpdatePostDomainDto } from '../../domain/dto/update-post-domain-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';
import { BlogsSqlRepository } from '../../../blogs/infrastructure/blogs.sql.repository';
import { UpdatePostForBlogCommandDto } from '../dto/update-post-for-blog-command-dto';

export class UpdatePostForBlogCommand {
  constructor(public dto: UpdatePostForBlogCommandDto) {}
}
@CommandHandler(UpdatePostForBlogCommand)
export class UpdatePostForBlogUseCase
  implements ICommandHandler<UpdatePostForBlogCommand>
{
  constructor(
    private postsRepository: PostsSqlRepository,
    private blogsRepository: BlogsSqlRepository,
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

    await this.postsRepository.updatePost(postForUpdate);
  }
}