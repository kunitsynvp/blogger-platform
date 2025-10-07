import { CreatePostDto } from './create-post-dto';
import { IsNumber } from 'class-validator';

export class CreatePostForBlogDto extends CreatePostDto {
  @IsNumber()
  blogId: number;

  static createDto(
    title: string,
    shortDescription: string,
    content: string,
    blogId: number,
  ) {
    const dto = new CreatePostForBlogDto();
    dto.title = title;
    dto.shortDescription = shortDescription;
    dto.content = content;
    dto.blogId = blogId;
    return dto;
  }
}
