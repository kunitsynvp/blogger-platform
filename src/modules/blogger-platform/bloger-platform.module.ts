import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { CommentsController } from './comments/api/comments.controller';
import { PostsController } from './posts/api/posts.controller';
import { CreateBlogUseCase } from './blogs/application/use-cases/create-blog-use-case';
import { DeleteBlogUseCase } from './blogs/application/use-cases/delete-blog-use-case';
import { UpdateBlogUseCase } from './blogs/application/use-cases/update-blog-use-case';
import { CreatePostUseCase } from './posts/application/use-cases/create-post-use-case';
import { DeletePostUseCase } from './posts/application/use-cases/delete-post-use-case';
import { GetBlogsQueryHandler } from './blogs/application/queries/get-blogs-query';
import { GetPostsQueryHandler } from './posts/application/queries/get-posts-query';
import { GetPostsForBlogQueryHandler } from './posts/application/queries/get-posts-for-blog-query';
import { GetBlogByIdOrFailQueryHandler } from './blogs/application/queries/get-blog-by-id-or-fail-query';
import { GetPostByIdOrFailQueryHandler } from './posts/application/queries/get-post-by-id-or-fail-query';
import { CommentLikeStatusUseCase } from './comments-likes/application/use-cases/comment-like-status-use-case';
import { CommentLikeSqlRepository } from './comments-likes/infrastructure/comment-like-sql-repository';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_INJECT_TOKEN,
  REFRESH_TOKEN_INJECT_TOKEN,
} from '../user-accounts/constants/jwt-tokens-inject-constants';
import { CreateCommentUseCase } from './comments/application/use-cases/create-comment-use-case';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { GetCommentByIdOrFailQueryHandler } from './comments/application/queries/get-comment-by-id-query';
import { GetCommentsQueryHandler } from './comments/application/queries/get-comments-query';
import { GetCommentsForPostQueryHandler } from './comments/application/queries/get-comments-for-post-query';
import { UpdateCommentUseCase } from './comments/application/use-cases/update-comment-use-case';
import { DeleteCommentUseCase } from './comments/application/use-cases/delete-comment-use-case';
import { PostLikeStatusUseCase } from './posts-likes/application/use-cases/post-like-status-use-case';
import { PostLikeConfig } from './posts-likes/config/post-likes-config';
import { BloggerPlatformConfig } from './config/blogger-platform-config';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/blogs-query-repository';
import { PostsRepository } from './posts/infrastructure/posts-repository';
import { PostsQueryRepository } from './posts/infrastructure/posts-query-repository';
import { BlogsSAController } from './blogs/api/blogs.sa.controller';
import { UpdatePostForBlogUseCase } from './posts/application/use-cases/update-post-for-blog-use-case';
import { CommentsSqlRepository } from './comments/infrastructure/comments.sql.repository';
import { CommentLikeSqlQueryRepository } from './comments-likes/infrastructure/comment-like-sql-query-repository';
import { PostLikeSqlRepository } from './posts-likes/infrastructure/post-like-sql.repository';
import { CommentsSqlQueryRepository } from './comments/infrastructure/comments-sql-query.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './blogs/domain/blog.entity';
import { Post } from './posts/domain/post.entity';

const useCases = [
  //blogs
  CreateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
  //posts
  CreatePostUseCase,
  DeletePostUseCase,
  // UpdatePostUseCase,
  UpdatePostForBlogUseCase,
  //comments
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  //comment likes
  CommentLikeStatusUseCase,
  //post likes
  PostLikeStatusUseCase,
];
const queryHandlers = [
  GetBlogsQueryHandler,
  GetBlogByIdOrFailQueryHandler,
  GetPostByIdOrFailQueryHandler,
  GetPostsQueryHandler,
  GetPostsForBlogQueryHandler,
  GetCommentByIdOrFailQueryHandler,
  GetCommentsQueryHandler,
  GetCommentsForPostQueryHandler,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([Blog, Post]),
    UserAccountsModule],
  exports: [],
  providers: [
    ...useCases,
    ...queryHandlers,
    BlogsRepository,
    BlogsQueryRepository,
    CommentsSqlRepository,
    CommentsSqlQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    CommentLikeSqlRepository,
    CommentLikeSqlQueryRepository,
    PostLikeSqlRepository,
    //PostLikeSqlQueryRepository,//TODO DO LOGIC IF NEEDED
    PostLikeConfig,
    BloggerPlatformConfig,
    {
      provide: ACCESS_TOKEN_INJECT_TOKEN,
      useFactory: (config: BloggerPlatformConfig): JwtService => {
        return new JwtService({
          secret: config.accessTokenSecret,
          signOptions: { expiresIn: config.accessTokenExpireIn },
        });
      },
      inject: [BloggerPlatformConfig],
    },
    {
      provide: REFRESH_TOKEN_INJECT_TOKEN,
      useFactory: (config: BloggerPlatformConfig): JwtService => {
        return new JwtService({
          secret: config.refreshTokenSecret,
          signOptions: { expiresIn: config.refreshTokenExpireIn },
        });
      },
      inject: [BloggerPlatformConfig],
    },
  ],
  controllers: [
    BlogsController,
    PostsController,
    CommentsController,
    BlogsSAController,
  ],
})
export class BloggerPlatformModule {}