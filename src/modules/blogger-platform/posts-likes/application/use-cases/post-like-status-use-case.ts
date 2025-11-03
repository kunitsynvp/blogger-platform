import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostLikeStatusDto } from '../../domain/dto/create-post-like-status-dto';
import { PostLike } from '../../domain/posts-like.entity';
import { CreatePostLikeCommandDto } from '../dto/create-post-like-command-dto';
import { PostsRepository } from '../../../posts/infrastructure/posts-repository';
import { PostLikeRepository } from '../../infrastructure/post-like-repository';
import { UsersExternalSqlRepository } from '../../../../user-accounts/infrastructure/external/users.external.sql.repository';

export class PostLikeStatusCommand {
  constructor(public dto: CreatePostLikeCommandDto) {}
}
@CommandHandler(PostLikeStatusCommand)
export class PostLikeStatusUseCase
  implements ICommandHandler<PostLikeStatusCommand, void>
{
  constructor(
    private postLikeRepository: PostLikeRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersExternalSqlRepository,
  ) {}
  async execute(command: PostLikeStatusCommand): Promise<void> {
    await this.postsRepository.findPostByIdOrFail(command.dto.postId);
    const foundUser = await this.usersRepository.findByIdOrFail(
      command.dto.userId,
    );

    const IsLikeStatusExisting = await this.postLikeRepository.getLikeStatus({
      postId: command.dto.postId,
      userId: command.dto.userId,
    });
    if (!IsLikeStatusExisting) {
      return this.createLikeStatus({
        postId: command.dto.postId,
        userId: command.dto.userId,
        likeStatus: command.dto.likeStatus,
      });
    }
    const OldLikeStatus = IsLikeStatusExisting;
    if (OldLikeStatus.likeStatus === command.dto.likeStatus) {
      return;
    } else {
      OldLikeStatus.updateLikeStatus(command.dto.likeStatus);
      await this.postLikeRepository.save(OldLikeStatus);
    }
  }
  private async createLikeStatus(dto: CreatePostLikeStatusDto): Promise<void> {
    const newLikeStatus = PostLike.createLikeStatus(dto);
    await this.postLikeRepository.save(newLikeStatus);
  }
}