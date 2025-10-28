import { CreateBlogInputDto } from '../../api/input-dto/blogs-create-dto';
import { CreateBlogDomainDto } from '../../domain/dto/create-blog-domain-dto';
import { Blog } from '../../domain/blog.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogInputDto) {}
}
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}
  async execute(command: CreateBlogCommand): Promise<number> {
    const domainDto = new CreateBlogDomainDto();
    domainDto.name = command.dto.name;
    domainDto.description = command.dto.description;
    domainDto.websiteUrl = command.dto.websiteUrl;

    const createdBlog = Blog.createBlog(domainDto);

    const createdBlogId = await this.blogsRepository.createBlog(createdBlog);

    return createdBlogId;
  }
}