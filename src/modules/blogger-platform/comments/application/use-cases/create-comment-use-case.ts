import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentCommandDto } from '../dto/create-comment-command-dto';
import { PostsSqlRepository } from '../../../posts/infrastructure/posts.sql.repository';
import { CommentsSqlRepository } from '../../infrastructure/comments.sql.repository';
import { UsersExternalSqlRepository } from '../../../../user-accounts/infrastructure/external/users.external.sql.repository';
import { Comment } from '../../domain/comment.entity';

export class CreateCommentCommand {
  constructor(public dto: CreateCommentCommandDto) {}
}
@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, number>
{
  constructor(
    private usersRepository: UsersExternalSqlRepository,
    private postsRepository: PostsSqlRepository,
    private commentsRepository: CommentsSqlRepository,
  ) {}
  async execute(command: CreateCommentCommand): Promise<number> {
    await this.usersRepository.findByIdOrFail(
      command.dto.userId,
    );

    await this.postsRepository.findPostByIdOrFail(command.dto.postId);

    const newComment = Comment.createComment({
      content: command.dto.content,
      userId: command.dto.userId,
      postId: command.dto.postId,
    });

    const createdCommentId = await this.commentsRepository.createComment(newComment);
    return createdCommentId;
  }
}