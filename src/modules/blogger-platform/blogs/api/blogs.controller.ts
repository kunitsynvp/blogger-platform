import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BlogsQueryDto } from './input-dto/blogs-query-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogsViewDto } from './view-dto/blogs-view-dto';
import { PostsQueryDto } from '../../posts/api/input-dto/posts-query-dto';
import { PostsViewDto } from '../../posts/api/view-dto/posts-view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBlogByIdOrFailQuery } from '../application/queries/get-blog-by-id-or-fail-query';
import { GetBlogsQuery } from '../application/queries/get-blogs-query';
import { GetPostsForBlogQuery } from '../../posts/application/queries/get-posts-for-blog-query';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth-guard';
import { OptionalCurrentUser } from '../../../user-accounts/guards/decorators/optional-current-user-param-decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { CustomParseIntPipe } from '../../../../core/pipes/int-transformation-pipe';

@Controller('blogs')
export class BlogsController {
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
  // @Post() //TODO return after 18hw
  // @UseGuards(BasicAuthGuard)
  // async postBlog(
  //   @Body() createBlogDto: CreateBlogInputDto,
  // ): Promise<BlogsViewDto> {
  //   const createdBlogId = await this.commandBus.execute<
  //     CreateBlogCommand,
  //     number
  //   >(new CreateBlogCommand(createBlogDto));
  //
  //   return await this.queryBus.execute<GetBlogByIdOrFailQuery, BlogsViewDto>(
  //     new GetBlogByIdOrFailQuery(createdBlogId),
  //   );
  // }
  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
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
    >(new GetPostsForBlogQuery(query, blogId, user?.userId));
  }

  // @Post(':blogId/posts')
  // @UseGuards(BasicAuthGuard)
  // async createPostForBlog(
  //   @Param('blogId', CustomParseIntPipe) blogId: number,
  //   @Body() createPostDto: CreatePostDto,
  // ): Promise<PostsViewDto> {
  //   const dto = CreatePostForBlogDto.createDto(
  //     createPostDto.title,
  //     createPostDto.shortDescription,
  //     createPostDto.content,
  //     blogId,
  //   );
  //   const postId = await this.commandBus.execute<CreatePostCommand, number>(
  //     new CreatePostCommand(dto),
  //   );
  //
  //   return await this.queryBus.execute<GetPostByIdOrFailQuery, PostsViewDto>(
  //     new GetPostByIdOrFailQuery(postId),
  //   );
  // }
  @Get(':id')
  async getBlogById(
    @Param('id', CustomParseIntPipe) id: number,
  ): Promise<BlogsViewDto> {
    return this.queryBus.execute<GetBlogByIdOrFailQuery, BlogsViewDto>(
      new GetBlogByIdOrFailQuery(id),
    );
  }

  // @HttpCode(204)
  // @UseGuards(BasicAuthGuard)
  // @Put(':id')
  // async putBlog(
  //   @Param('id', CustomParseIntPipe) id: number,
  //   @Body() updateBlogDto: UpdateBlogInputDto,
  // ): Promise<void> {
  //   return await this.commandBus.execute<UpdateBlogCommand, void>(
  //     new UpdateBlogCommand(id, updateBlogDto),
  //   );
  // }

  // @HttpCode(204)
  // @Delete(':id')
  // @UseGuards(BasicAuthGuard)
  // async deleteBlog(
  //   @Param('id', ObjectIdValidationPipe) id: string,
  // ): Promise<void> {
  //   return await this.commandBus.execute<DeleteBlogCommand, void>(
  //     new DeleteBlogCommand(id),
  //   );
  // }
}