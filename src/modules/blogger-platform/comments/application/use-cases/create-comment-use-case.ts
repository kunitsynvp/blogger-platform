import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentCommandDto } from '../dto/create-comment-command-dto';
import { UserDocument } from '../../../../user-accounts/domain/user/user.entity';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import type { CommentModelType } from '../../domain/comment.entity';
import { Comment } from '../../domain/comment.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { UsersExternalRepository } from '../../../../user-accounts/infrastructure/external/users.external.repository';

export class CreateCommentCommand {
  constructor(public dto: CreateCommentCommandDto) {}
}
@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, string>
{
  constructor(
    private usersRepository: UsersExternalRepository,
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
    @InjectModel(Comment.name) private commentModel: CommentModelType,
  ) {}
  async execute(command: CreateCommentCommand) {
    const foundUser: UserDocument = await this.usersRepository.findByIdOrFail(
      command.dto.userId,
    );

    await this.postsRepository.findPostByIdOrFail(command.dto.postId);

    const newComment = this.commentModel.createComment({
      content: command.dto.content,
      userLogin: foundUser.login,
      userId: command.dto.userId,
      postId: command.dto.postId,
    });

    const createdComment = await this.commentsRepository.save(newComment);
    return createdComment._id.toString();
  }
}