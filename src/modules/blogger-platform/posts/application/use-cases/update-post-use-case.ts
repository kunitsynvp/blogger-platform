import { UpdatePostDomainDto } from '../../domain/dto/update-post-domain-dto';
import { UpdatePostDto } from '../../api/input-dto/update-post-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts-repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class UpdatePostCommand {
  constructor(
    public id: number,
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
    await this.blogsRepository.findBlogByIdOrFail(
      command.dto.blogId,
    );

    const postForUpdate = await this.postsRepository.findPostByIdOrFail(
      command.id,
    );

    const updateDto = UpdatePostDomainDto.createDto(
      command.dto.title,
      command.dto.shortDescription,
      command.dto.content,
      command.dto.blogId
    );

    postForUpdate.updatePost(updateDto);

    //await this.postsRepository.save(postForUpdate); //TODO logic after 18hw
  }
}