import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim-validation-decorator';
import { commentConstraints } from '../../domain/constraints/comment-constraints';

export class UpdateCommentInputDto {
  @IsStringWithTrim(
    commentConstraints.minContentLength,
    commentConstraints.maxContentLength)
  content: string
}