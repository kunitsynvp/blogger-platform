import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsQueryDto } from './input-dto/blogs-query-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogsViewDto } from './view-dto/blogs-view-dto';
import { CreateBlogInputDto } from './input-dto/blogs-create-dto';
import { UpdateBlogInputDto } from './input-dto/blogs-update-dto';
import { PostsQueryDto } from '../../posts/api/input-dto/posts-query-dto';
import { PostsViewDto } from '../../posts/api/view-dto/posts-view-dto';
import { CreatePostForBlogDto } from '../../posts/api/input-dto/create-post-for-blog-dto';
import { CreatePostDto } from '../../posts/api/input-dto/create-post-dto';
import { CreateBlogCommand } from '../application/use-cases/create-blog-use-case';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post-use-case';
import { UpdateBlogCommand } from '../application/use-cases/update-blog-use-case';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog-use-case';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBlogByIdOrFailQuery } from '../application/queries/get-blog-by-id-or-fail-query';
import { GetBlogsQuery } from '../application/queries/get-blogs-query';
import { GetPostsForBlogQuery } from '../../posts/application/queries/get-posts-for-blog-query';
import { GetPostByIdOrFailQuery } from '../../posts/application/queries/get-post-by-id-or-fail-query';
import { OptionalCurrentUser } from '../../../user-accounts/guards/decorators/optional-current-user-param-decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth-guard';
import { UpdatePostForBlogDto } from '../../posts/api/input-dto/update-post-for-blog-dto';
import { UpdatePostForBlogCommandDto } from '../../posts/application/dto/update-post-for-blog-command-dto';
import { UpdatePostForBlogCommand } from '../../posts/application/use-cases/update-post-for-blog-use-case';
import { DeletePostCommand } from '../../posts/application/use-cases/delete-post-use-case';
import { CustomParseIntPipe } from '../../../../core/pipes/int-transformation-pipe';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class BlogsSAController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}
  @Get()
  async getAllBlogs(
    @Query() query: BlogsQueryDto,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    return this.queryBus.execute<
      GetBlogsQuery,
      PaginatedViewDto<BlogsViewDto[]>
    >(new GetBlogsQuery(query));
  }
  @Post()
  async postBlog(
    @Body() createBlogDto: CreateBlogInputDto,
  ): Promise<BlogsViewDto> {
    const createdBlogId = await this.commandBus.execute<
      CreateBlogCommand,
      number
    >(new CreateBlogCommand(createBlogDto));

    return await this.queryBus.execute<GetBlogByIdOrFailQuery, BlogsViewDto>(
      new GetBlogByIdOrFailQuery(createdBlogId),
    );
  }
  @Get(':blogId/posts')
  async getPostsForBlog(
    @OptionalCurrentUser() user: UserContextDto,
    @Param('blogId', CustomParseIntPipe) blogId: number,
    @Query() query: PostsQueryDto,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    await this.queryBus.execute<GetBlogByIdOrFailQuery, BlogsViewDto>(
      new GetBlogByIdOrFailQuery(blogId),
    );
    return await this.queryBus.execute<
      GetPostsForBlogQuery,
      PaginatedViewDto<PostsViewDto[]>
    >(new GetPostsForBlogQuery(query, blogId, user.userId));
  }

  @Post(':blogId/posts')
  async createPostForBlog(
    @Param('blogId', CustomParseIntPipe) blogId: number,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostsViewDto> {
    const dto = CreatePostForBlogDto.createDto(
      createPostDto.title,
      createPostDto.shortDescription,
      createPostDto.content,
      blogId,
    );
    const postId = await this.commandBus.execute<CreatePostCommand, number>(
      new CreatePostCommand(dto),
    );

    return await this.queryBus.execute<GetPostByIdOrFailQuery, PostsViewDto>(
      new GetPostByIdOrFailQuery(postId),
    );
  }
  @HttpCode(204)
  @Put(':blogId/posts/:postId')
  async updatePostForBlog(
    @Param('blogId', CustomParseIntPipe) blogId: number,
    @Param('postId', CustomParseIntPipe) postId: number,
    @Body() updatePostDto: UpdatePostForBlogDto,
  ): Promise<void> {
    const commandDto = UpdatePostForBlogCommandDto.createDto(
      updatePostDto.title,
      updatePostDto.shortDescription,
      updatePostDto.content,
      blogId,
      postId,
    );
    return this.commandBus.execute<UpdatePostForBlogCommand, void>(
      new UpdatePostForBlogCommand(commandDto),
    );
  }
  @Get(':id')
  async getBlogById(
    @Param('id', CustomParseIntPipe) id: number,
  ): Promise<BlogsViewDto> {
    return this.queryBus.execute<GetBlogByIdOrFailQuery, BlogsViewDto>(
      new GetBlogByIdOrFailQuery(id),
    );
  }

  @HttpCode(204)
  @Put(':id')
  async putBlog(
    @Param('id', CustomParseIntPipe) id: number,
    @Body() updateBlogDto: UpdateBlogInputDto,
  ): Promise<void> {
    return await this.commandBus.execute<UpdateBlogCommand, void>(
      new UpdateBlogCommand(id, updateBlogDto),
    );
  }

  @HttpCode(204)
  @Delete(':blogId/posts/:postId')
  async deletePostForBlog(
    @Param('blogId', CustomParseIntPipe) blogId: number,
    @Param('postId', CustomParseIntPipe) postId: number,
  ): Promise<void> {
    await this.queryBus.execute<GetBlogByIdOrFailQuery, BlogsViewDto>(
      new GetBlogByIdOrFailQuery(blogId),
    );
    return await this.commandBus.execute<DeletePostCommand, void>(
      new DeletePostCommand(postId),
    );
  }
  @HttpCode(204)
  @Delete(':blogId')
  async deleteBlog(
    @Param('blogId', CustomParseIntPipe) blogId: number,
  ): Promise<void> {
    return await this.commandBus.execute<DeleteBlogCommand, void>(
      new DeleteBlogCommand(blogId),
    );
  }
}