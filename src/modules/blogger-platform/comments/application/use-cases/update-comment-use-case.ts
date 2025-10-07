import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateCommentCommandDto } from '../dto/update-comment-command-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';

export class UpdateCommentCommand {
  constructor(public dto: UpdateCommentCommandDto) {}
}
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand, void>
{
  constructor(
    private commentsRepository: CommentsSqlRepository,
  ) {}
  async execute(command: UpdateCommentCommand) {
    const foundComment = await this.commentsRepository.findByIdOrFail(
      command.dto.commentId,
    );

    if (foundComment.userId!== command.dto.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'This user has no rights to change another user`s comment',
        field: 'None',
      });
    }

    foundComment.updateComment({
      content: command.dto.content,
    })

    await this.commentsRepository.updateComment(foundComment);
  }
}