import { CreateBlogInputDto } from '../../api/input-dto/blogs-create-dto';
import { CreateBlogDomainDto } from '../../domain/dto/create-blog-domain-dto';
import { InjectModel } from '@nestjs/mongoose';
import type { BlogModelType } from '../../domain/blog.entity';
import { Blog } from '../../domain/blog.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogInputDto) {}
}
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}
  async execute(command: CreateBlogCommand): Promise<string> {
    const domainDto = new CreateBlogDomainDto();
    domainDto.name = command.dto.name;
    domainDto.description = command.dto.description;
    domainDto.websiteUrl = command.dto.websiteUrl;

    const createdBlog = this.blogModel.createBlog(domainDto);

    await this.blogsRepository.save(createdBlog);

    return createdBlog._id.toString();
  }
}