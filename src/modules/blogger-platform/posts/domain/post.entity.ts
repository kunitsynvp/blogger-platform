import { CreatePostDomainDto } from './dto/create-post-domain-dto';
import { CheckExceptionsPostDto } from './dto/check-exceptions-post-dto';
import { UpdatePostDomainDto } from './dto/update-post-domain-dto';
import { postConstraints } from './constraints/post-constraints';
import { LikeStatus } from '../../comments/domain/enums/like-status-enum';
import { LikeDetailsViewDto } from '../api/view-dto/posts-view-dto';

export class Post {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  createdAt: Date;

  static createPost(dto: CreatePostDomainDto): Post {
    const newPost = new this();
    const excDto = new CheckExceptionsPostDto();
    excDto.title = dto.title;
    excDto.content = dto.content;
    excDto.shortDescription = dto.shortDescription;
    newPost.checkPostsExceptions(excDto);

    newPost.title = dto.title;
    newPost.shortDescription = dto.shortDescription;
    newPost.content = dto.content;
    newPost.blogId = dto.blogId;
    newPost.createdAt = new Date();

    return newPost;
  }
  updatePost(dto: UpdatePostDomainDto) {
    const excDto = new CheckExceptionsPostDto();
    excDto.title = dto.title;
    excDto.content = dto.content;
    excDto.shortDescription = dto.shortDescription;
    this.checkPostsExceptions(excDto);

    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
  }

  checkPostsExceptions(dto: CheckExceptionsPostDto) {
    if (dto.title.length > postConstraints.maxTitleLength) {
      throw new Error('invalid title');
    }
    if (
      dto.shortDescription.length > postConstraints.maxShortDescriptionLength
    ) {
      throw new Error('invalid shortDescription');
    }
    if (dto.content.length > postConstraints.maxContentLength) {
      throw new Error('invalid content');
    }
  }

}
export type PostDbType = {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  createdAt: Date;
}
export type PostCompoundDbType = {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  blogName: string;
  createdAt: Date;
  likesCount: string;
  dislikesCount: string;
  myStatus: LikeStatus
  newestLikes: LikeDetailsViewDto[]
}
