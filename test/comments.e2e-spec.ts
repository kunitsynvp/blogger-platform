import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersTestManager } from './e2e/helpers/users-test-manager';
import { initSettings } from './e2e/helpers/testing-app-init';
import { deleteAllData } from './e2e/helpers/delete-all-data';
import { CommentsTestManager } from './e2e/helpers/comments-test-manager';
import { PostsTestManager } from './e2e/helpers/posts-test-manager';
import { LikeStatus } from '../src/modules/blogger-platform/comments/domain/enums/like-status-enum';
import mongoose from 'mongoose';

describe('Comments flow (e2e) tests', () => {
  let app: INestApplication;
  let userTestManger: UsersTestManager;
  let commentsTestManager: CommentsTestManager;
  let postsTestManager: PostsTestManager;

  afterAll(async () => {
    await app.close();
  });
  const defaults = {
    login: 'newLogin',
    email: 'newEmail@mail.ru',
    password: 'newPassword',
    newPassword: 'newNewPassword',
    content: 'newVeryLongContentAtLeast21Characters',
  };

  describe('POST(/comments/like-status) like statuses for comments e2e tests', () => {
    beforeEach(async () => {
      // const result = await initSettings((moduleBuilder) =>
      //   moduleBuilder.overrideProvider(JwtService).useValue(
      //     new JwtService({
      //       secret: 'secret_key',
      //       signOptions: { expiresIn: '1m' },
      //     }),
      //   ),
      // );
      const result = await initSettings();
      app = result.app;
      commentsTestManager = result.commentsTestManager;
      postsTestManager = result.postsTestManager;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ Should create like for comment', async () => {
      const post = await postsTestManager.createPostInDb();
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );

      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const comment = await commentsTestManager.createCommentInForPost(
        'newContentForComment',
        accessToken,
        createdUser.id,
        post.id,
      );
      expect(comment.likesInfo.likesCount).toBe(0);
      expect(comment.likesInfo.dislikesCount).toBe(0);

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'Like' })
        .expect(204);
      const commentWithLike = await commentsTestManager.getCommentById(
        comment.id,
      );
      expect(commentWithLike).not.toBeUndefined();
      expect(commentWithLike.likesInfo.likesCount).toBe(1);
      expect(commentWithLike.likesInfo.dislikesCount).toBe(0);
    });
    it('(400) ❌ Shouldn`t create like for comment with invalid likeStatus', async () => {
      const post = await postsTestManager.createPostInDb();
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );

      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const comment = await commentsTestManager.createCommentInForPost(
        'newContentForComment',
        accessToken,
        createdUser.id,
        post.id,
      );
      expect(comment.likesInfo.likesCount).toBe(0);
      expect(comment.likesInfo.dislikesCount).toBe(0);

      const invalidLikeStatus = 'dizlike';
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          likeStatus: invalidLikeStatus,
        })
        .expect(400);
      const commentWithLike = await commentsTestManager.getCommentById(
        comment.id,
      );
      expect(commentWithLike).not.toBeUndefined();
      expect(commentWithLike.likesInfo.likesCount).toBe(0);
      expect(commentWithLike.likesInfo.dislikesCount).toBe(0);
    });
    it('(401) ❌ Shouldn`t create like for comment with invalid token', async () => {
      const post = await postsTestManager.createPostInDb();
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );

      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const comment = await commentsTestManager.createCommentInForPost(
        'newContentForComment',
        accessToken,
        createdUser.id,
        post.id,
      );
      expect(comment.likesInfo.likesCount).toBe(0);
      expect(comment.likesInfo.dislikesCount).toBe(0);

      const someInvalidToken = 'invalidToken';
       await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .set('Authorization', `Bearer ${someInvalidToken}`)
        .send({
          likeStatus: LikeStatus.Like,
        })
        .expect(401);
      const commentWithLike = await commentsTestManager.getCommentById(
        comment.id,
      );
      expect(commentWithLike).not.toBeUndefined();
      expect(commentWithLike.likesInfo.likesCount).toBe(0);
      expect(commentWithLike.likesInfo.dislikesCount).toBe(0);
    });
    it('(400) ❌ Shouldn`t create like for comment with invalid commentId', async () => {
      const post = await postsTestManager.createPostInDb();
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const comment = await commentsTestManager.createCommentInForPost(
        'newContentForComment',
        accessToken,
        createdUser.id,
        post.id,
      );
      expect(comment.likesInfo.likesCount).toBe(0);
      expect(comment.likesInfo.dislikesCount).toBe(0);
      const invalidCommentId = 'invalidCommentId';
      await request(app.getHttpServer())
        .put(`/comments/${invalidCommentId}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'Like' })
        .expect(400);
      const commentWithLike = await commentsTestManager.getCommentById(
        comment.id,
      );
      expect(commentWithLike).not.toBeUndefined();
      expect(commentWithLike.likesInfo.likesCount).toBe(0);
      expect(commentWithLike.likesInfo.dislikesCount).toBe(0);
    });
    it('(404) ❌ Shouldn`t create like for comment with invalid commentId', async () => {
      const post = await postsTestManager.createPostInDb();
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const comment = await commentsTestManager.createCommentInForPost(
        'newContentForComment',
        accessToken,
        createdUser.id,
        post.id,
      );
      expect(comment.likesInfo.likesCount).toBe(0);
      expect(comment.likesInfo.dislikesCount).toBe(0);

      let invalidCommentId = '6899faa5b6cd8a78f7707fb0';

      await request(app.getHttpServer())
        .put(`/comments/${invalidCommentId}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'Like' })
        .expect(404);
      const commentWithLike = await commentsTestManager.getCommentById(
        comment.id,
      );
      expect(commentWithLike).not.toBeUndefined();
      expect(commentWithLike.likesInfo.likesCount).toBe(0);
      expect(commentWithLike.likesInfo.dislikesCount).toBe(0);
    });
    it('(204) ✅ Shouldn`t create two likes for comment by one user, likes amount should not change', async () => {
      const post = await postsTestManager.createPostInDb();
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const comment = await commentsTestManager.createCommentInForPost(
        'newContentForComment',
        accessToken,
        createdUser.id,
        post.id,
      );
      expect(comment.likesInfo.likesCount).toBe(0);
      expect(comment.likesInfo.dislikesCount).toBe(0);

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'Like' })
        .expect(204);
      const commentWithLike1 = await commentsTestManager.getCommentById(
        comment.id,
      );
      expect(commentWithLike1).not.toBeUndefined();
      expect(commentWithLike1.likesInfo.likesCount).toBe(1);
      expect(commentWithLike1.likesInfo.dislikesCount).toBe(0);

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'Like' })
        .expect(204);
      const commentWithLike2 = await commentsTestManager.getCommentById(
        comment.id,
      );
      expect(commentWithLike2).not.toBeUndefined();
      expect(commentWithLike2.likesInfo.likesCount).toBe(1);
      expect(commentWithLike2.likesInfo.dislikesCount).toBe(0);
    });
    it('(204) ✅ should change like to dislike for comment', async () => {
      const post = await postsTestManager.createPostInDb();
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const comment = await commentsTestManager.createCommentInForPost(
        'newContentForComment',
        accessToken,
        createdUser.id,
        post.id,
      );
      expect(comment.likesInfo.likesCount).toBe(0);
      expect(comment.likesInfo.dislikesCount).toBe(0);

       await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: 'Like' })
        .expect(204);
      const commentWithLike1 = await commentsTestManager.getCommentById(
        comment.id,
      );
      expect(commentWithLike1).not.toBeUndefined();
      expect(commentWithLike1.likesInfo.likesCount).toBe(1);
      expect(commentWithLike1.likesInfo.dislikesCount).toBe(0);

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ likeStatus: LikeStatus.Dislike })
        .expect(204);
      const commentWithLike2 = await commentsTestManager.getCommentById(
        comment.id,
      );
      expect(commentWithLike2).not.toBeUndefined();
      expect(commentWithLike2.likesInfo.likesCount).toBe(0);
      expect(commentWithLike2.likesInfo.dislikesCount).toBe(1);
    });
  });

  describe('GET(/comments/commentId) Get comment by id with likes and optional auth middleware e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ Should get comment with 1 like and myStatus (like) with authorization', async () => {
      const post = await postsTestManager.createPostInDb();
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const comment = await commentsTestManager.createCommentInForPost(
        'newContentForComment',
        accessToken,
        createdUser.id,
        post.id,
      );
      expect(comment.likesInfo.likesCount).toBe(0);
      expect(comment.likesInfo.dislikesCount).toBe(0);

      await commentsTestManager.createLikeStatusForComment(
        comment.id,
        accessToken,
        LikeStatus.Like,
      );

      const res = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body).toEqual({
        id: comment.id,
        content: comment.content,
        commentatorInfo: comment.commentatorInfo,
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
        },
      });
    });
    it('(204) ✅ Should get comment with 1 like and myStatus (none) with NO authorization', async () => {
      const post = await postsTestManager.createPostInDb();
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const comment = await commentsTestManager.createCommentInForPost(
        'newContentForComment',
        accessToken,
        createdUser.id,
        post.id,
      );
      expect(comment.likesInfo.likesCount).toBe(0);
      expect(comment.likesInfo.dislikesCount).toBe(0);

      await commentsTestManager.createLikeStatusForComment(
        comment.id,
        accessToken,
        LikeStatus.Like,
      );

      const invalidToken = 'invalidToken';
      const res = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(200);
      expect(res.body).toEqual({
        id: comment.id,
        content: comment.content,
        commentatorInfo: comment.commentatorInfo,
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
        },
      });
    });
  });

  describe('GET(/posts/:postId/comments) Get comments by postId with likes and optional auth middleware e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
    });

    it('(204) ✅ should get comment with 4 likes and myStatus (like) with authorization ', async () => {
      const result =
        await userTestManger.createSeveralAccessAndRefreshTokensWithSeveralUsers(
          4,
        );
      await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );

      const { accessToken, user } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const post = await postsTestManager.createPostInDb();
      const comment = await commentsTestManager.createCommentInForPost(
        'newContentForComment',
        accessToken,
        user._id.toString(),
        post.id,
      );

      expect(comment.likesInfo.likesCount).toBe(0);
      expect(comment.likesInfo.dislikesCount).toBe(0);
      for (let i = 0; i < result.users.length; i++) {
        await commentsTestManager.createLikeStatusForComment(
          comment.id,
          result.accessTokens[i],
          LikeStatus.Like,
        );
      }

      const res = await request(app.getHttpServer())
        .get(`/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${result.accessTokens[0]}`)
        .expect(200);
      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: expect.any(Array),
      });
      expect(res.body.items[0]).toEqual({
        id: comment.id,
        content: comment.content,
        commentatorInfo: comment.commentatorInfo,
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: 4,
          dislikesCount: 0,
          myStatus: 'Like',
        },
      });
    });
    it('(204) ✅ should get comment with 4 likes and myStatus (none) with no authorization', async () => {
      const result =
        await userTestManger.createSeveralAccessAndRefreshTokensWithSeveralUsers(
          4,
        );
      await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );

      const { accessToken, user } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const post = await postsTestManager.createPostInDb();
      const comment = await commentsTestManager.createCommentInForPost(
        'newContentForComment',
        accessToken,
        user._id.toString(),
        post.id,
      );

      expect(comment.likesInfo.likesCount).toBe(0);
      expect(comment.likesInfo.dislikesCount).toBe(0);
      for (let i = 0; i < result.users.length; i++) {
        await commentsTestManager.createLikeStatusForComment(
          comment.id,
          result.accessTokens[i],
          LikeStatus.Like,
        );
      }
      const invalidToken = 'invalidToken';
      const res = await request(app.getHttpServer())
        .get(`/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(200);
      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: expect.any(Array),
      });
      expect(res.body.items[0]).toEqual({
        id: comment.id,
        content: comment.content,
        commentatorInfo: comment.commentatorInfo,
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: 4,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });
  });

  describe('POST(/posts/:postId/comments) Post comments e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManger = result.userTestManger;
      postsTestManager = result.postsTestManager;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(401) ❌ Should not create a new comment with wrong authorization', async () => {
      const post = await postsTestManager.createPostInDb();

      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', 'someWrongToken')
        //.send({})
        .expect(401);
    });
    it('(400) ❌ Should not create a new comment with invalid input body data', async () => {
      await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      console.log(accessToken);

      const post = await postsTestManager.createPostInDb();
      const creationData = {
        content: 'too small text',
      };
      console.log('token test', accessToken);
      const response = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(creationData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errorsMessages: [{ field: 'content', message: expect.any(String) }],
      });
    });
    it('(404) ❌ Shouldn`t create a new comment with unexisting postId and return error', async () => {
      await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );

      await postsTestManager.createPostInDb();
      const creationData = {
        content: 'newUpdateContentContent',
      };
      const invalidPostId = '507f1f77bcf86cd799439011';
      const response = await request(app.getHttpServer())
        .post(`/posts/${invalidPostId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(creationData)
        .expect(404);

      expect(response.body).toEqual({
        errorsMessages: [{ field: 'id', message: expect.any(String) }],
      });
    });
    it('(201) ✅ Should create a comment with correct input data', async () => {
      await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );

      const post = await postsTestManager.createPostInDb();
      const creationData = {
        content: 'newUpdateContentContent',
      };
      const response = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(creationData)
        .expect(201);
      expect(response.body).toEqual({
        id: expect.any(String),
        ...creationData,
        commentatorInfo: expect.any(Object),
        createdAt: expect.any(String),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });
  });

  describe('PUT(/comments/:commentId) put posts e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(400) ❌ Shouldn`t update a comment with incorrect(empty) input data', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );

      const post = await postsTestManager.createPostInDb();
      const createdComment = await commentsTestManager.createCommentInForPost(
        defaults.content,
        accessToken,
        createdUser._id.toString(),
        post.id,
      );

      request(app.getHttpServer())
        .put(`/comments/${createdComment.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);
    });
    it('(403) ❌ Shouldn`t update an another user`s comment', async () => {
      const anotherLogin = 'an-rLogin';
      const anotherPassword = 'anotherPassword';
      const anotherEmail = 'anotheremail@mail.ru';

      const createdUser1 = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      await userTestManger.createUserByRegistration(
        anotherLogin,
        anotherPassword,
        anotherEmail,
      );

      const accessTokenObj1 = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const accessTokenObj2 = await userTestManger.loginUser(
        anotherLogin,
        anotherPassword,
      );

      const post = await postsTestManager.createPostInDb();
      const createdComment = await commentsTestManager.createCommentInForPost(
        defaults.content,
        accessTokenObj1.accessToken,
        createdUser1._id.toString(),
        post.id,
      );

      request(app.getHttpServer())
        .put(`/comments/${createdComment.id}`)
        .set('Authorization', `Bearer ${accessTokenObj2.accessToken}`)
        .send({ content: defaults.content })
        .expect(403);
    });
    it('(404) ❌ Shouldn`t update a comment with incorrect input data(id)', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );

      const post = await postsTestManager.createPostInDb();
      await commentsTestManager.createCommentInForPost(
        defaults.content,
        accessToken,
        createdUser._id.toString(),
        post.id,
      );
      const invalidCommentId = new mongoose.Types.ObjectId(
        '507f1f77bcf86cd799439011',
      );
      request(app.getHttpServer())
        .put(`/comments/${invalidCommentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: defaults.content })
        .expect(404);
    });
    it('(204) ✅ Should update a comment with correct input data', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );

      const post = await postsTestManager.createPostInDb();
      const createdComment = await commentsTestManager.createCommentInForPost(
        defaults.content,
        accessToken,
        createdUser._id.toString(),
        post.id,
      );
      request(app.getHttpServer())
        .put(`/comments/${createdComment.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: defaults.content })
        .expect(204);
    });
  });

  describe('DELETE(/comments/:commentId) delete comments e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      userTestManger = result.userTestManger;
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(404) ❌ Shouldn`t delete a comment with invalid id(random string)', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );

      const post = await postsTestManager.createPostInDb();
      await commentsTestManager.createCommentInForPost(
        defaults.content,
        accessToken,
        createdUser._id.toString(),
        post.id,
      );
      const invalidCommentId = new mongoose.Types.ObjectId(
        '507f1f77bcf86cd799439011',
      );
      request(app.getHttpServer())
        .delete(`/comments/${invalidCommentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: defaults.content })
        .expect(404);
    });
    it('(400) ❌ Shouldn`t delete a comment with invalid id(invalid type)', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );

      const post = await postsTestManager.createPostInDb();
      await commentsTestManager.createCommentInForPost(
        defaults.content,
        accessToken,
        createdUser._id.toString(),
        post.id,
      );
      const invalidCommentId = true;
      request(app.getHttpServer())
        .delete(`/comments/${invalidCommentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: defaults.content })
        .expect(400);
    });
    it('(401) ❌ Shouldn`t delete a comment without authorization', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );

      const post = await postsTestManager.createPostInDb();
      const createdComment = await commentsTestManager.createCommentInForPost(
        defaults.content,
        accessToken,
        createdUser._id.toString(),
        post.id,
      );
      const invalidToken = 'someInvalidToken';
      request(app.getHttpServer())
        .delete(`/comments/${createdComment.id}`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ content: defaults.content })
        .expect(404);
    });
    it('(403) ❌ Shouldn`t delete an another user`s comment', async () => {
      const anotherLogin = 'an-rLogin';
      const anotherPassword = 'anotherPassword';
      const anotherEmail = 'anotheremail@mail.ru';

      const createdUser1 = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
     await userTestManger.createUserByRegistration(
        anotherLogin,
        anotherPassword,
        anotherEmail,
      );

      const accessTokenObj1 = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );
      const accessTokenObj2 = await userTestManger.loginUser(
        anotherLogin,
        anotherPassword,
      );

      const post = await postsTestManager.createPostInDb();
      const createdComment = await commentsTestManager.createCommentInForPost(
        defaults.content,
        accessTokenObj1.accessToken,
        createdUser1._id.toString(),
        post.id,
      );

      request(app.getHttpServer())
        .delete(`/comments/${createdComment.id}`)
        .set('Authorization', `Bearer ${accessTokenObj2.accessToken}`)
        .send({ content: defaults.content })
        .expect(403);
    });
    it('(204) ✅ Should delete a comment with correct input', async () => {
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const { accessToken } = await userTestManger.loginUser(
        defaults.login,
        defaults.password,
      );

      const post = await postsTestManager.createPostInDb();
      const createdComment = await commentsTestManager.createCommentInForPost(
        defaults.content,
        accessToken,
        createdUser._id.toString(),
        post.id,
      );
      request(app.getHttpServer())
        .delete(`/comments/${createdComment.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: defaults.content })
        .expect(204);
    });
  });
});