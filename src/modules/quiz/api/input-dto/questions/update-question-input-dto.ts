import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim-validation-decorator';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { questionsConstraints } from '../../../domain/questions/constraints/questions-constraints';

export class UpdateQuestionInputDto {
  @IsStringWithTrim(
    questionsConstraints.bodyMinLength,
    questionsConstraints.bodyMaxLength,
  )
  body: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  correctAnswers: string[] = [];
}