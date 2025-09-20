import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UpdateBlogInputDto } from '../../api/input-dto/blogs-update-dto';
import { UpdateBlogDomainDto } from '../../domain/dto/update-blog-domain-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public dto: UpdateBlogInputDto,
  ) {}
}
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}
  async execute(command: UpdateBlogCommand): Promise<void> {
    console.log('update blog command');
    const foundBlog = await this.blogsRepository.findBlogsByIdOrFail(
      command.id,
    );

    const domainDto = new UpdateBlogDomainDto();
    domainDto.name = command.dto.name;
    domainDto.description = command.dto.description;
    domainDto.websiteUrl = command.dto.websiteUrl;

    foundBlog.updateBlog(domainDto);
    await this.blogsRepository.save(foundBlog);
  }
}