import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';

export class DeleteCommentCommand {
  constructor(
    public commentId: number,
    public userId: number,
  ) {}
}
@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand, void>
{
  constructor(private commentsRepository: CommentsSqlRepository) {}
  async execute(command: DeleteCommentCommand) {
    const foundComment = await this.commentsRepository.findByIdOrFail(
      command.commentId,
    );

    if (foundComment.userId !== command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'This user has no rights to change another user`s comment',
        field: 'None',
      });
    }
    return await this.commentsRepository.deleteCommentOrFail(command.commentId);
  }
}