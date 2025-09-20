import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CreatePostLikeStatusDto } from '../../domain/dto/create-post-like-status-dto';
import { UsersExternalRepository } from '../../../../user-accounts/infrastructure/external/users.external.repository';
import { PostLikeRepository } from '../../infrastructure/post-like-repository';
import { PostLike } from '../../domain/posts-like-entity';
import type { PostLikeModelType } from '../../domain/posts-like-entity';
import { CreatePostLikeCommandDto } from '../dto/create-post-like-command-dto';

export class PostLikeStatusCommand {
  constructor(public dto: CreatePostLikeCommandDto) {}
}
@CommandHandler(PostLikeStatusCommand)
export class PostLikeStatusUseCase
  implements ICommandHandler<PostLikeStatusCommand, void>
{
  constructor(
    @InjectModel(PostLike.name)
    private commentLikeModel: PostLikeModelType,
    private postLikeRepository: PostLikeRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersExternalRepository,
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
        login: foundUser.login
      });
    }
    const OldLikeStatus = IsLikeStatusExisting;
    if (OldLikeStatus.status === command.dto.likeStatus) {
      return;
    } else {
      OldLikeStatus.updateLikeStatus(command.dto.likeStatus);
      await this.postLikeRepository.save(OldLikeStatus);
    }
  }
  private async createLikeStatus(
    dto: CreatePostLikeStatusDto,
  ): Promise<void> {
    const newLikeStatus = this.commentLikeModel.createLikeStatus(dto);
    await this.postLikeRepository.save(newLikeStatus);
  }
}