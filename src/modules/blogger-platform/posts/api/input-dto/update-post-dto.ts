import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim-validation-decorator';
import { postConstraints } from '../../domain/constraints/post-constraints';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdatePostDto {
  @IsStringWithTrim(
    postConstraints.minTitleLength,
    postConstraints.maxTitleLength,
  )
  @IsNotEmpty()
  title: string;

  @IsStringWithTrim(
    postConstraints.minShortDescriptionLength,
    postConstraints.maxShortDescriptionLength,
  )
  @IsNotEmpty()
  shortDescription: string;

  @IsStringWithTrim(
    postConstraints.minContentLength,
    postConstraints.maxContentLength,
  )
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  blogId: string;
}
