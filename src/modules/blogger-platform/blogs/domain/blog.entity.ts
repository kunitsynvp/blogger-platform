import { CreateBlogDomainDto } from './dto/create-blog-domain-dto';
import { UpdateBlogDomainDto } from './dto/update-blog-domain-dto';
import { blogConstraints } from './constraints/blog-constraints';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../posts/domain/post.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'varchar',
    length: 30,
    collation: 'C'
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 1000,
    collation: 'C'
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 200,
    collation: 'C'
  })
  websiteUrl: string;

  @Column({
    type: 'boolean'
  })
  isMembership: boolean;

  @Column({
    type: 'timestamp without time zone'
  })
  createdAt: Date;

  @OneToMany(() => Post, p => p.blog)
  posts: Post[];

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

