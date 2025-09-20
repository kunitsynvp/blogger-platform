import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { BlogModelType } from '../domain/blog.entity';
import { Blog } from '../domain/blog.entity';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreateBlogInputDto } from '../api/input-dto/blogs-create-dto';
import { CreateBlogDomainDto } from '../domain/dto/create-blog-domain-dto';
import { UpdateBlogInputDto } from '../api/input-dto/blogs-update-dto';
import { UpdateBlogDomainDto } from '../domain/dto/update-blog-domain-dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}

  async createBlog(dto: CreateBlogInputDto): Promise<string> {
    const domainDto = new CreateBlogDomainDto();
    domainDto.name = dto.name;
    domainDto.description = dto.description;
    domainDto.websiteUrl = dto.websiteUrl;

    const createdBlog = this.blogModel.createBlog(domainDto);

    await this.blogsRepository.save(createdBlog);

    return createdBlog._id.toString();
  }
  async updateBlog(id: string, dto: UpdateBlogInputDto): Promise<void> {
    const foundBlog = await this.blogsRepository.findBlogsByIdOrFail(id);

    const domainDto = new UpdateBlogDomainDto();
    domainDto.name = dto.name;
    domainDto.description = dto.description;
    domainDto.websiteUrl = dto.websiteUrl;

    foundBlog.updateBlog(domainDto);
    await this.blogsRepository.save(foundBlog);
  }
  async deleteBlog(id: string): Promise<void> {
    return await this.blogsRepository.deleteBlog(id);
  }
}
