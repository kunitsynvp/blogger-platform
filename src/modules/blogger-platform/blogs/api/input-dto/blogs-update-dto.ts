import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim-validation-decorator';
import { blogConstraints } from '../../domain/constraints/blog-constraints';
import { IsNotEmpty, Matches } from 'class-validator';

export class UpdateBlogInputDto {
  @IsStringWithTrim(blogConstraints.nameMinLength, blogConstraints.nameMaxLength)
  @IsNotEmpty()
  name : string
  @IsStringWithTrim(blogConstraints.descriptionMinLength, blogConstraints.descriptionMaxLength)
  @IsNotEmpty()
  description : string
  @IsStringWithTrim(blogConstraints.websiteUrlMinLength,blogConstraints.websiteUrlMaxLength)
  @Matches(blogConstraints.webSiteUrlMatch)
  websiteUrl : string
}