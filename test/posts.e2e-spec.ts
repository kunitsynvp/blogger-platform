import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersTestManager } from './e2e/helpers/users-test-manager';
import { initSettings } from './e2e/helpers/testing-app-init';
import { deleteAllData } from './e2e/helpers/delete-all-data';
import { PostsTestManager } from './e2e/helpers/posts-test-manager';
import { LikeStatus } from '../src/modules/blogger-platform/comments/domain/enums/like-status-enum';

describe('Post flow (e2e) tests', () => {
  const basicAuthString: string = "Basic YWRtaW46cXdlcnR5"
  let app: INestApplication;
  let userTestManger: UsersTestManager;
  let postsTestManager: PostsTestManager;

  afterAll(async () => {
    await app.close();
  });
  const defaults = {
    login: 'newLogin',
    email: 'newEmail@mail.ru',
    password: 'newPassword',
    title: "newTitle",
    shortDescription: 'newShortDescription',
    content: "newContent",

  };

  describe('POST(/posts/like-status) like statuses for posts e2e tests', () => {
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
      postsTestManager = result.postsTestManager;
      userTestManger = result.userTestManger
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ Should create like for post', async () => {
      const post = await postsTestManager.createPostInDb()
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)

      const res = await request(app.getHttpServer())
        .put(`/posts/${post._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: "Like"})
        .expect(204)
      const postWithLike = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike).not.toBeUndefined()
      expect(postWithLike.extendedLikesInfo.likesCount).toBe(1)
      expect(postWithLike.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)
      expect(postWithLike.extendedLikesInfo.newestLikes).toEqual([
        {
          addedAt: expect.any(String),
          login: createdUser.login,
          userId: createdUser._id.toString(),

        }
      ])
    });
    it("(400) ❌ Shouldn`t create like for post with invalid likeStatus", async () => {
      const post = await postsTestManager.createPostInDb()
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      const invalidLikeStatus = "dizlike"
      const res = await request(app.getHttpServer())
        .put(`/posts/${post._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: invalidLikeStatus})
        .expect(400)
      expect(res.body.errorsMessages[0].field).toBe('likeStatus')
      const postWithLike = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike).not.toBeUndefined()
      expect(postWithLike.extendedLikesInfo.likesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.myStatus).toBe(LikeStatus.None)
      expect(postWithLike.extendedLikesInfo.newestLikes).toEqual([])
    })
    it("(401) ❌ Shouldn`t create like for comment with invalid token", async () => {
      const post = await postsTestManager.createPostInDb()
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      const invalidToke = "invalidToken"
      const res = await request(app.getHttpServer())
        .put(`/posts/${post._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${invalidToke}`)
        .send({likeStatus: LikeStatus.Like})
        .expect(401)
      expect(res.body.errorsMessages[0].field).toBe('None')
      const postWithLike = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike).not.toBeUndefined()
      expect(postWithLike.extendedLikesInfo.likesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.myStatus).toBe(LikeStatus.None)
      expect(postWithLike.extendedLikesInfo.newestLikes).toEqual([])
    })
    it("(400) ❌ Shouldn`t create like for post with invalid postId", async () => {
      const post = await postsTestManager.createPostInDb()
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      const invalidPostId = "invalidPostId"
      const res = await request(app.getHttpServer())
        .put(`/posts/${invalidPostId}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: LikeStatus.Like})
        .expect(400)
      expect(res.body.errorsMessages[0].field).toBe('id')
      const postWithLike = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike).not.toBeUndefined()
      expect(postWithLike.extendedLikesInfo.likesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.myStatus).toBe(LikeStatus.None)
      expect(postWithLike.extendedLikesInfo.newestLikes).toEqual([])
    })
    it("(404) ❌ Shouldn`t create like for post with invalid postId", async () => {

      const post = await postsTestManager.createPostInDb()
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      let invalidPostId = "6899faa5b6cd8a78f7707fb0"
      const res = await request(app.getHttpServer())
        .put(`/posts/${invalidPostId}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: LikeStatus.Like})
        .expect(404)
      expect(res.body.errorsMessages[0].field).toBe('id')
      const postWithLike = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike).not.toBeUndefined()
      expect(postWithLike.extendedLikesInfo.likesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.myStatus).toBe(LikeStatus.None)
      expect(postWithLike.extendedLikesInfo.newestLikes).toEqual([])

    })
    it("(204) ✅ Shouldn`t create two likes for comment by one user, likes amount should not change", async () => {
      const post = await postsTestManager.createPostInDb()
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)

      const res = await request(app.getHttpServer())
        .put(`/posts/${post._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: "Like"})
        .expect(204)
      const postWithLike1 = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike1).not.toBeUndefined()
      expect(postWithLike1.extendedLikesInfo.likesCount).toBe(1)
      expect(postWithLike1.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike1.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)
      expect(postWithLike1.extendedLikesInfo.newestLikes).toEqual([
        {
          addedAt: expect.any(String),
          login: createdUser.login,
          userId: createdUser._id.toString(),

        }])
      const res2 = await request(app.getHttpServer())
        .put(`/posts/${post._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: "Like"})
        .expect(204)
      const postWithLike2 = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike2).not.toBeUndefined()
      expect(postWithLike2.extendedLikesInfo.likesCount).toBe(1)
      expect(postWithLike2.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike2.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)
      expect(postWithLike2.extendedLikesInfo.newestLikes).toEqual([
        {
          addedAt: expect.any(String),
          login: createdUser.login,
          userId: createdUser._id.toString(),

        }])
    })
    it("(204) ✅ should change like to dislike for comment", async () => {
      const post = await postsTestManager.createPostInDb()
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)

      const res = await request(app.getHttpServer())
        .put(`/posts/${post._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: "Like"})
        .expect(204)
      const postWithLike1 = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike1).not.toBeUndefined()
      expect(postWithLike1.extendedLikesInfo.likesCount).toBe(1)
      expect(postWithLike1.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike1.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)
      expect(postWithLike1.extendedLikesInfo.newestLikes).toEqual([
        {
          addedAt: expect.any(String),
          login: createdUser.login,
          userId: createdUser._id.toString(),

        }])
      const res2 = await request(app.getHttpServer())
        .put(`/posts/${post._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: "Dislike"})
        .expect(204)
      const postWithLike2 = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike2).not.toBeUndefined()
      expect(postWithLike2.extendedLikesInfo.likesCount).toBe(0)
      expect(postWithLike2.extendedLikesInfo.dislikesCount).toBe(1)
      expect(postWithLike2.extendedLikesInfo.myStatus).toBe(LikeStatus.Dislike)
      expect(postWithLike2.extendedLikesInfo.newestLikes).toEqual([])
    })
  })
  describe('Get(/posts) Get posts with likes e2e tests', () => {
    beforeEach(async () => {
      const result = await initSettings();
      app = result.app;
      postsTestManager = result.postsTestManager;
      userTestManger = result.userTestManger
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ Should create likes by 4 different users for post', async () => {
      const post = await postsTestManager.createPostInDb()
      const {users, accessTokens} = await userTestManger.createUsersBySAAndLogin(4);


      await postsTestManager.createLikeStatusesByUsers(accessTokens,LikeStatus.Like, post._id.toString())

      const postWithLikeByUser1 = await postsTestManager.getPostViewById(post._id.toString(), accessTokens[0]);
      expect(postWithLikeByUser1).not.toBeUndefined()
      expect(postWithLikeByUser1.extendedLikesInfo.likesCount).toBe(4)
      expect(postWithLikeByUser1.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLikeByUser1.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)
      expect(postWithLikeByUser1.extendedLikesInfo.newestLikes).toEqual([
        {
          addedAt: expect.any(String),
          login: users[3].login,
          userId: users[3].id,

        },
        {
          addedAt: expect.any(String),
          login: users[2].login,
          userId: users[2].id,

        },
        {
          addedAt: expect.any(String),
          login: users[1].login,
          userId: users[1].id,
        },
      ])
    });
    it("(204) ✅ Shouldn`t create 3 likes for post by 3 users and create 1 dislike by 4th user and get posts by 4th user", async () => {
      const post = await postsTestManager.createPostInDb()
      const {users, accessTokens} = await userTestManger.createUsersBySAAndLogin(4);


      await postsTestManager.createLikeStatusesByUsers(accessTokens.slice(0,4),LikeStatus.Like, post._id.toString())
      await postsTestManager.createLikeStatusesByUsers(accessTokens.slice(3),LikeStatus.Dislike, post._id.toString())

      const postWithLikeByUser4 = await postsTestManager.getPostViewById(post._id.toString(), accessTokens[3]);
      expect(postWithLikeByUser4).not.toBeUndefined()
      expect(postWithLikeByUser4.extendedLikesInfo.likesCount).toBe(3)
      expect(postWithLikeByUser4.extendedLikesInfo.dislikesCount).toBe(1)
      expect(postWithLikeByUser4.extendedLikesInfo.myStatus).toBe(LikeStatus.Dislike)
      expect(postWithLikeByUser4.extendedLikesInfo.newestLikes).toEqual([
        {
          addedAt: expect.any(String),
          login: users[2].login,
          userId: users[2].id,

        },
        {
          addedAt: expect.any(String),
          login: users[1].login,
          userId: users[1].id,

        },
        {
          addedAt: expect.any(String),
          login: users[0].login,
          userId: users[0].id,
        },
      ])
    })
    it(
      '(204) ✅ Should Create 6 posts then: like post 1 by user 1, user 2; ' +
        'like post 2 by user 2, user 3; ' +
        'dislike post 3 by user 1; ' +
        'like post 4 by user 1, user 4, user 2, user 3; ' +
        'like post 5 by user 2, dislike by user 3; ' +
        'like post 6 by user 1, dislike by user 2. ' +
        'Get the posts by user 1',
      async () => {
        const { posts } = await postsTestManager.createPostsInDb(6);
        const { users, accessTokens } =
          await userTestManger.createUsersBySAAndLogin(3);

        //like post1 by user1,user2
        await postsTestManager.createLikeStatusesByUsers(
          accessTokens.slice(0, 1),
          LikeStatus.Like,
          posts[0]._id.toString(),
        );
        await postsTestManager.createLikeStatusesByUsers(
          accessTokens.slice(1, 2),
          LikeStatus.Like,
          posts[0]._id.toString(),
        );

        //like post2 by user2,user3
        await postsTestManager.createLikeStatusesByUsers(
          accessTokens.slice(1, 2),
          LikeStatus.Like,
          posts[1]._id.toString(),
        );
        await postsTestManager.createLikeStatusesByUsers(
          accessTokens.slice(2, 3),
          LikeStatus.Like,
          posts[1]._id.toString(),
        );

        //dislike post3 by user1
        await postsTestManager.createLikeStatusesByUsers(
          accessTokens.slice(0, 1),
          LikeStatus.Dislike,
          posts[2]._id.toString(),
        );

        //like post 4 by user 1, user 4, user 2, user 3
        await postsTestManager.createLikeStatusesByUsers(
          accessTokens.slice(0, 1),
          LikeStatus.Like,
          posts[3]._id.toString(),
        );
        await postsTestManager.createLikeStatusesByUsers(
          accessTokens.slice(3, 4),
          LikeStatus.Like,
          posts[3]._id.toString(),
        );
        await postsTestManager.createLikeStatusesByUsers(
          accessTokens.slice(1, 2),
          LikeStatus.Like,
          posts[3]._id.toString(),
        );
        await postsTestManager.createLikeStatusesByUsers(
          accessTokens.slice(2, 3),
          LikeStatus.Like,
          posts[3]._id.toString(),
        );

        //like post 5 by user 2, dislike by user 3
        await postsTestManager.createLikeStatusesByUsers(
          accessTokens.slice(1, 2),
          LikeStatus.Like,
          posts[4]._id.toString(),
        );
        await postsTestManager.createLikeStatusesByUsers(
          accessTokens.slice(2, 3),
          LikeStatus.Dislike,
          posts[4]._id.toString(),
        );

        //like post 6 by user 1, dislike by user 2
        await postsTestManager.createLikeStatusesByUsers(
          accessTokens.slice(0, 1),
          LikeStatus.Like,
          posts[5]._id.toString(),
        );
        await postsTestManager.createLikeStatusesByUsers(
          accessTokens.slice(1, 2),
          LikeStatus.Dislike,
          posts[5]._id.toString(),
        );

        const foundPosts = await request(app.getHttpServer())
          .get('/posts')
          //.query({sortDirection: SortDirection.Asc})
          .set('Authorization', `Bearer ${accessTokens[0]}`);

        let i = 1
        console.log("posts:",foundPosts.body);
        console.log('Extended likes info');
        for (const items of foundPosts.body.items) {
          console.log(`post${i}:`,items.extendedLikesInfo);
        }
        // expect(foundPosts).not.toBeUndefined()
        // expect(foundPosts.extendedLikesInfo.likesCount).toBe(0)
        // expect(foundPosts.extendedLikesInfo.dislikesCount).toBe(0)
        // expect(foundPosts.extendedLikesInfo.myStatus).toBe(LikeStatus.None)
        // expect(foundPosts.extendedLikesInfo.newestLikes).toEqual([])
      }, 20000
    );
  })
  describe('POST(/posts/like-status) like statuses for posts e2e tests', () => {
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
      postsTestManager = result.postsTestManager;
      userTestManger = result.userTestManger
    });
    afterEach(async () => {
      await deleteAllData(app);
      jest.restoreAllMocks();
    });

    it('(204) ✅ Should create like for post', async () => {
      const post = await postsTestManager.createPostInDb()
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)

      const res = await request(app.getHttpServer())
        .put(`/posts/${post._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: "Like"})
        .expect(204)
      const postWithLike = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike).not.toBeUndefined()
      expect(postWithLike.extendedLikesInfo.likesCount).toBe(1)
      expect(postWithLike.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)
      expect(postWithLike.extendedLikesInfo.newestLikes).toEqual([
        {
          addedAt: expect.any(String),
          login: createdUser.login,
          userId: createdUser._id.toString(),

        }
      ])
    });
    it("(400) ❌ Shouldn`t create like for post with invalid likeStatus", async () => {
      const post = await postsTestManager.createPostInDb()
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      const invalidLikeStatus = "dizlike"
      const res = await request(app.getHttpServer())
        .put(`/posts/${post._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: invalidLikeStatus})
        .expect(400)
      expect(res.body.errorsMessages[0].field).toBe('likeStatus')
      const postWithLike = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike).not.toBeUndefined()
      expect(postWithLike.extendedLikesInfo.likesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.myStatus).toBe(LikeStatus.None)
      expect(postWithLike.extendedLikesInfo.newestLikes).toEqual([])
    })
    it("(401) ❌ Shouldn`t create like for comment with invalid token", async () => {
      const post = await postsTestManager.createPostInDb()
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      const invalidToke = "invalidToken"
      const res = await request(app.getHttpServer())
        .put(`/posts/${post._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${invalidToke}`)
        .send({likeStatus: LikeStatus.Like})
        .expect(401)
      expect(res.body.errorsMessages[0].field).toBe('None')
      const postWithLike = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike).not.toBeUndefined()
      expect(postWithLike.extendedLikesInfo.likesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.myStatus).toBe(LikeStatus.None)
      expect(postWithLike.extendedLikesInfo.newestLikes).toEqual([])
    })
    it("(400) ❌ Shouldn`t create like for post with invalid postId", async () => {
      const post = await postsTestManager.createPostInDb()
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      const invalidPostId = "invalidPostId"
      const res = await request(app.getHttpServer())
        .put(`/posts/${invalidPostId}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: LikeStatus.Like})
        .expect(400)
      expect(res.body.errorsMessages[0].field).toBe('id')
      const postWithLike = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike).not.toBeUndefined()
      expect(postWithLike.extendedLikesInfo.likesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.myStatus).toBe(LikeStatus.None)
      expect(postWithLike.extendedLikesInfo.newestLikes).toEqual([])
    })
    it("(404) ❌ Shouldn`t create like for post with invalid postId", async () => {

      const post = await postsTestManager.createPostInDb()
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)
      let invalidPostId = "6899faa5b6cd8a78f7707fb0"
      const res = await request(app.getHttpServer())
        .put(`/posts/${invalidPostId}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: LikeStatus.Like})
        .expect(404)
      expect(res.body.errorsMessages[0].field).toBe('id')
      const postWithLike = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike).not.toBeUndefined()
      expect(postWithLike.extendedLikesInfo.likesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike.extendedLikesInfo.myStatus).toBe(LikeStatus.None)
      expect(postWithLike.extendedLikesInfo.newestLikes).toEqual([])

    })
    it("(204) ✅ Shouldn`t create two likes for comment by one user, likes amount should not change", async () => {
      const post = await postsTestManager.createPostInDb()
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)

      const res = await request(app.getHttpServer())
        .put(`/posts/${post._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: "Like"})
        .expect(204)
      const postWithLike1 = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike1).not.toBeUndefined()
      expect(postWithLike1.extendedLikesInfo.likesCount).toBe(1)
      expect(postWithLike1.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike1.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)
      expect(postWithLike1.extendedLikesInfo.newestLikes).toEqual([
        {
          addedAt: expect.any(String),
          login: createdUser.login,
          userId: createdUser._id.toString(),

        }])
      const res2 = await request(app.getHttpServer())
        .put(`/posts/${post._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: "Like"})
        .expect(204)
      const postWithLike2 = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike2).not.toBeUndefined()
      expect(postWithLike2.extendedLikesInfo.likesCount).toBe(1)
      expect(postWithLike2.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike2.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)
      expect(postWithLike2.extendedLikesInfo.newestLikes).toEqual([
        {
          addedAt: expect.any(String),
          login: createdUser.login,
          userId: createdUser._id.toString(),

        }])
    })
    it("(204) ✅ should change like to dislike for comment", async () => {
      const post = await postsTestManager.createPostInDb()
      const createdUser = await userTestManger.createUserByRegistration(
        defaults.login,
        defaults.password,
        defaults.email,
      );
      const {accessToken} = await userTestManger.loginUser(defaults.login, defaults.password)

      const res = await request(app.getHttpServer())
        .put(`/posts/${post._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: "Like"})
        .expect(204)
      const postWithLike1 = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike1).not.toBeUndefined()
      expect(postWithLike1.extendedLikesInfo.likesCount).toBe(1)
      expect(postWithLike1.extendedLikesInfo.dislikesCount).toBe(0)
      expect(postWithLike1.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)
      expect(postWithLike1.extendedLikesInfo.newestLikes).toEqual([
        {
          addedAt: expect.any(String),
          login: createdUser.login,
          userId: createdUser._id.toString(),

        }])
      const res2 = await request(app.getHttpServer())
        .put(`/posts/${post._id.toString()}/like-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({likeStatus: "Dislike"})
        .expect(204)
      const postWithLike2 = await postsTestManager.getPostViewById(post._id.toString(), accessToken);
      expect(postWithLike2).not.toBeUndefined()
      expect(postWithLike2.extendedLikesInfo.likesCount).toBe(0)
      expect(postWithLike2.extendedLikesInfo.dislikesCount).toBe(1)
      expect(postWithLike2.extendedLikesInfo.myStatus).toBe(LikeStatus.Dislike)
      expect(postWithLike2.extendedLikesInfo.newestLikes).toEqual([])
    })
  })
});