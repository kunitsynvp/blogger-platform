import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { UpdatePostDomainDto } from '../../domain/dto/update-post-domain-dto';
import { UpdatePostDto } from '../../api/input-dto/update-post-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdatePostCommand {
  constructor(
    public id: string,
    public dto: UpdatePostDto,
  ) {}
}
@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    const foundBlog = await this.blogsRepository.findBlogsByIdOrFail(
      command.dto.blogId,
    );

    const postForUpdate = await this.postsRepository.findPostByIdOrFail(
      command.id,
    );

    const updateDto = UpdatePostDomainDto.createDto(
      command.dto.title,
      command.dto.shortDescription,
      command.dto.content,
      command.dto.blogId,
      foundBlog.name,
    );

    postForUpdate.updatePost(updateDto);

    await this.postsRepository.save(postForUpdate);
  }
}