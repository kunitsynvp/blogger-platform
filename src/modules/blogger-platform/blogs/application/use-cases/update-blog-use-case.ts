import { UpdateBlogInputDto } from '../../api/input-dto/blogs-update-dto';
import { UpdateBlogDomainDto } from '../../domain/dto/update-blog-domain-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql.repository';

export class UpdateBlogCommand {
  constructor(
    public id: number,
    public dto: UpdateBlogInputDto,
  ) {}
}
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsSqlRepository) {}
  async execute(command: UpdateBlogCommand): Promise<void> {
    const foundBlog = await this.blogsRepository.findBlogByIdOrFail(
      command.id,
    );

    const domainDto = new UpdateBlogDomainDto();
    domainDto.name = command.dto.name;
    domainDto.description = command.dto.description;
    domainDto.websiteUrl = command.dto.websiteUrl;

    foundBlog.updateBlog(domainDto);
    foundBlog.id = command.id

    await this.blogsRepository.updateBlog(foundBlog);
  }
}