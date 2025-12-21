import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BlogsTestManager } from './blogs-test-manager';
import { PostsViewDto } from '../../../../src/modules/blogger-platform/posts/api/view-dto/posts-view-dto';
import { LikeStatus } from '../../../../src/modules/blogger-platform/comments/domain/enums/like-status-enum';
import { delay } from '../delay';
import { BlogsViewDto } from '../../../../src/modules/blogger-platform/blogs/api/view-dto/blogs-view-dto';
import { PostsRepository } from '../../../../src/modules/blogger-platform/posts/infrastructure/posts-repository';
import { Post } from '../../../../src/modules/blogger-platform/posts/domain/post.entity';

export class PostsTestManager {
  private readonly BasicAuthString: string = 'Basic YWRtaW46cXdlcnR5';
  private readonly postPostPath: string = '/posts';
  private readonly defaults = {
    title: 'newTitle',
    shortDescription: 'newShortDescription',
    content: 'newContent',
  };

  private postsRepository: PostsRepository;
  private blogsTestManager: BlogsTestManager;

  constructor(private app: INestApplication) {
    this.postsRepository = this.app.get<PostsRepository>(PostsRepository);
    this.blogsTestManager = new BlogsTestManager(this.app);
  }

  async createPostInDb(): Promise<Post> {
    const createdBlog = await this.blogsTestManager.createBlogInDb();
    const createdPost = await request(this.app.getHttpServer())
      .post(`/sa/blogs/${createdBlog.id}/posts`)
      .set('Authorization', this.BasicAuthString)
      .send({
        title: this.defaults.title,
        shortDescription: this.defaults.shortDescription,
        content: this.defaults.content,
      });
    return this.postsRepository.findPostByIdOrFail(createdPost.body.id);
  }
  async createPostInDbWIthBlog(blogId: number): Promise<Post> {
    const createdPost = await request(this.app.getHttpServer())
      .post(`/sa/blogs/${blogId}/posts`)
      .set('Authorization', this.BasicAuthString)
      .send({
        title: this.defaults.title,
        shortDescription: this.defaults.shortDescription,
        content: this.defaults.content,
        blogId: blogId,
      });
    return this.postsRepository.findPostByIdOrFail(createdPost.body.id);
  }
  async createPostsInDb(
    count: number,
  ): Promise<{ posts: Post[]; blog: BlogsViewDto }> {
    const createdBlog = await this.blogsTestManager.createBlogInDb();
    const posts = [] as Post[];
    for (let i = 0; i < count; i++) {
      const createdPost = await request(this.app.getHttpServer())
        .post(`/sa/blogs/${createdBlog.id}/posts`)
        .set('Authorization', this.BasicAuthString)
        .send({
          title: this.defaults.title,
          shortDescription: this.defaults.shortDescription,
          content: this.defaults.content,
        });
      const post = await this.postsRepository.findPostByIdOrFail(
        createdPost.body.id,
      );
      posts.push(post);
    }
    return { posts: posts, blog: createdBlog };
  }
  async getPostById(id: number): Promise<Post> {
    return this.postsRepository.findPostByIdOrFail(id);
  }
  async getPostViewById(
    id: number,
    accessToken?: string,
  ): Promise<PostsViewDto> {
    if (accessToken) {
      const response = await request(this.app.getHttpServer())
        .get(`/posts/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      return response.body;
    }
    const response = await request(this.app.getHttpServer())
      .get(`/posts/${id}`)
      .expect(200);
    return response.body;
  }
  async createLikeStatusesByUsers(
    usersAccessTokens: string[],
    statusToCreate: LikeStatus,
    postId: number,
  ): Promise<void> {
    for (const userAccessToken of usersAccessTokens) {
      await request(this.app.getHttpServer())
        .put(`/posts/${postId}/like-status`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({ likeStatus: statusToCreate })
        .expect(204);
    }
    await delay(500);
  }
}
