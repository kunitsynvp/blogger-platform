import { Blog } from '../../domain/blog.entity';
import { BlogDbType } from '../../infrastructure/blogs-query-repository';

export class BlogsViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;

  static mapToView(blog: BlogDbType){
    const viewDto = new BlogsViewDto();
    viewDto.id = blog.id.toString();
    viewDto.name = blog.name;
    viewDto.description = blog.description;
    viewDto.websiteUrl = blog.websiteUrl;
    viewDto.createdAt = blog.createdAt.toISOString();
    viewDto.isMembership = blog.isMembership;

    return viewDto;
  }
}