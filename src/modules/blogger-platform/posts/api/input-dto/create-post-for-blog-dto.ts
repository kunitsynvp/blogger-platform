import { CreatePostDto } from './create-post-dto';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transformation/trim-decorator';

export class CreatePostForBlogDto extends CreatePostDto{
  @IsString()
  @Trim()
  @IsNotEmpty()
  @IsMongoId()
  blogId: string

  static createDto(title:string,shortDescription:string, content:string, blogId: string){
    const dto = new CreatePostForBlogDto()
    dto.title = title
    dto.shortDescription = shortDescription
    dto.content = content
    dto.blogId = blogId
    return dto
  }
}
