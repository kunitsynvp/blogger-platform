import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersRepository } from '../../../src/modules/user-accounts/infrastructure/users.repository';
import { CommandBus } from '@nestjs/cqrs';
import { PostsTestManager } from './posts-test-manager';
import { CommentsQueryRepository } from '../../../src/modules/blogger-platform/comments/infrastructure/comments-query.repository';
import { CommentsViewDto } from '../../../src/modules/blogger-platform/comments/api/view-dto/comments-view-dto';
import { LikeStatus } from '../../../src/modules/blogger-platform/comments/domain/enums/like-status-enum';

export class CommentsTestManager {

  private usersRepository: UsersRepository;
  private commandBus: CommandBus;
  private postsTestManager: PostsTestManager;
  private commentsQueryRepository: CommentsQueryRepository;
  private defaults: {
    content: 'newVeryLongContentAtLeast21Characters';
  };

  constructor(private app: INestApplication) {
    this.usersRepository = this.app.get<UsersRepository>(UsersRepository);
    this.commandBus = this.app.get<CommandBus>(CommandBus);
    this.postsTestManager = new PostsTestManager(this.app);
    this.commentsQueryRepository = this.app.get<CommentsQueryRepository>(
      CommentsQueryRepository,
    );
  }
  async createCommentInForPost(
    content: string = this.defaults.content,
    accessToken: string,
    userId: string,
    postId: string,
  ): Promise<CommentsViewDto> {
    const commentResult = await request(this.app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: content,
      })
      .expect(201);
    return await this.commentsQueryRepository.findByIdOrFail(
      commentResult.body.id,
      userId,
    );
  }
  async getCommentById(id: string): Promise<CommentsViewDto> {
    const response = await request(this.app.getHttpServer())
      .get(`/comments/${id}`)
      .expect(200);
    return response.body;
  }
  async createLikeStatusForComment(
    commentId: string,
    accessToken: string,
    status: LikeStatus,
  ) {
    await request(this.app.getHttpServer())
      .put(`/comments/${commentId}/like-status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ likeStatus: status })
      .expect(204);

    const commentWithLike = await this.getCommentById(commentId);
    expect(commentWithLike).not.toBeUndefined();
  }
}
