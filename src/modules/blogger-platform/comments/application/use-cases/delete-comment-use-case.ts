import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}
@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand, void>
{
  constructor(private commentsRepository: CommentsRepository) {}
  async execute(command: DeleteCommentCommand) {
    const foundComment = await this.commentsRepository.findByIdOrFail(
      command.commentId,
    );

    if (foundComment.commentatorInfo.userId.toString() !== command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'This user has no rights to change another user`s comment',
        field: 'None',
      });
    }
    return await this.commentsRepository.deleteCommentOrFail(command.commentId);
  }
}