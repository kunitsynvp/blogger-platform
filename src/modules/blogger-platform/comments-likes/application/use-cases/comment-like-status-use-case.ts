import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentLikeRepository } from '../../infrastructure/comment-like-repository';
import { CreateCommentLikeStatusDto } from '../dto/create-comment-like-status-dto';
import { CommentLike} from '../../domain/comments-like.entity';
import { GetCommentLikesInfoDto } from '../../infrastructure/dto/get-like-status-dto';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';

export class CommentLikeStatusCommand {
  constructor(public dto: CreateCommentLikeStatusDto) {}
}
@CommandHandler(CommentLikeStatusCommand)
export class CommentLikeStatusUseCase implements ICommandHandler<
  CommentLikeStatusCommand,
  void> {
  constructor(private commentLikeRepository: CommentLikeRepository,
              private commentsRepository: CommentsRepository,) {
  }
  async execute(command: CommentLikeStatusCommand): Promise<void> {
    const dto: GetCommentLikesInfoDto = {
      commentId: command.dto.commentId,
      userId: command.dto.userId
    }
    await this.commentsRepository.findByIdOrFail(command.dto.commentId)

    const IsLikeStatusExisting = await this.commentLikeRepository.getLikeStatus(dto)
    if (!IsLikeStatusExisting) {
      return this.createLikeStatus(command.dto);
    }

    const OldLikeStatus = IsLikeStatusExisting
    if(OldLikeStatus.status === command.dto.likeStatus) {
      return
    } else {
      OldLikeStatus.updateLikeStatus(command.dto.likeStatus)
      await this.commentLikeRepository.save(OldLikeStatus)
    }

  }
  private async createLikeStatus(dto: CreateCommentLikeStatusDto ): Promise<void> {
    const newLikeStatus = CommentLike.createLikeStatus(dto)
    await this.commentLikeRepository.save(newLikeStatus)
  }
}