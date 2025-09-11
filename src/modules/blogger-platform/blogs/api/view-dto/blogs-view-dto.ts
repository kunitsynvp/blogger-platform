import { BlogDocument } from '../../domain/blog.entity';

export class BlogsViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  static mapToView(dto: BlogDocument){
    const blog = new BlogsViewDto();
    blog.id = dto._id.toString();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.createdAt = dto.createdAt.toISOString();
    blog.isMembership = dto.isMembership;

    return blog;
  }
}