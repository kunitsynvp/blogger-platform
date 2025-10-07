import { CreateBlogDomainDto } from './dto/create-blog-domain-dto';
import { UpdateBlogDomainDto } from './dto/update-blog-domain-dto';
import { blogConstraints } from './constraints/blog-constraints';

export class Blog {
  id: number
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;

  static createBlog(dto: CreateBlogDomainDto): Blog {
    const blog = new this();
    blog.checkExceptions(dto);

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;
    blog.createdAt = new Date();

    return blog;
  }
  checkExceptions(dto: CreateBlogDomainDto) {
    if (dto.name.length > blogConstraints.nameMaxLength) {
      throw new Error('invalid name');
    }
    if (dto.description.length > blogConstraints.descriptionMaxLength) {
      throw new Error('invalid description');
    }
    if (dto.websiteUrl.length > blogConstraints.websiteUrlMaxLength) {
      throw new Error('invalid websiteUrl');
    }
    if (!blogConstraints.webSiteUrlMatch.test(dto.websiteUrl)) {
      throw new Error('invalid websiteUrl');
    }
  }

  updateBlog(dto: UpdateBlogDomainDto) {
    this.checkExceptions(dto);

    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}
export type BlogDbType = {
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
}
