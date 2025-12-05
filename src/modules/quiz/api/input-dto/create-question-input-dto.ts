import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim-validation-decorator';
import { IsArray, IsString } from 'class-validator';
import { questionsDbConstraints } from '../../domain/questions/constraints/questions-constraints';

export class CreateQuestionInputDto {
  @IsStringWithTrim(
    questionsDbConstraints.bodyMinLength,
    questionsDbConstraints.bodyMaxLength,
  )
  body: string;

  @IsArray()
  @IsString({ each: true })
  correctAnswers: string[];
}