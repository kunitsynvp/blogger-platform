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
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation-pipe';
import { CreateBlogCommand } from '../application/use-cases/create-blog-use-case';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post-use-case';
import { UpdateBlogCommand } from '../application/use-cases/update-blog-use-case';
import { DeleteBlogCommand } from '../application/use-cases/delete-blog-use-case';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBlogByIdOrFailQuery } from '../application/queries/get-blog-by-id-or-fail-query';
import { GetBlogsQuery } from '../application/queries/get-blogs-query';
import { GetPostsForBlogQuery } from '../../posts/application/queries/get-posts-for-blog-query';
import { GetPostByIdOrFailQuery } from '../../posts/application/queries/get-post-by-id-or-fail-query';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth-guard';
import { OptionalCurrentUser } from '../../../user-accounts/guards/decorators/optional-current-user-param-decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth-guard';

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
  @Post()
  @UseGuards(BasicAuthGuard)
  async postBlog(
    @Body() createBlogDto: CreateBlogInputDto,
  ): Promise<BlogsViewDto> {
    const createdBlogId = await this.commandBus.execute<
      CreateBlogCommand,
      string
    >(new CreateBlogCommand(createBlogDto));

    return await this.queryBus.execute<GetBlogByIdOrFailQuery, BlogsViewDto>(
      new GetBlogByIdOrFailQuery(createdBlogId),
    );
  }
  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostsForBlog(
    @OptionalCurrentUser() user: UserContextDto,
    @Param('blogId', ObjectIdValidationPipe) blogId: string,
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
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param('blogId', ObjectIdValidationPipe) blogId: string,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostsViewDto> {
    const dto = CreatePostForBlogDto.createDto(
      createPostDto.title,
      createPostDto.shortDescription,
      createPostDto.content,
      blogId,
    );
    const postId = await this.commandBus.execute<CreatePostCommand, string>(
      new CreatePostCommand(dto),
    );

    return await this.queryBus.execute<GetPostByIdOrFailQuery, PostsViewDto>(
      new GetPostByIdOrFailQuery(postId),
    );
  }
  @Get(':id')
  async getBlogById(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<BlogsViewDto> {
    return this.queryBus.execute<GetBlogByIdOrFailQuery, BlogsViewDto>(
      new GetBlogByIdOrFailQuery(id),
    );
  }

  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async putBlog(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() updateBlogDto: UpdateBlogInputDto,
  ): Promise<void> {
    return await this.commandBus.execute<UpdateBlogCommand, void>(
      new UpdateBlogCommand(id, updateBlogDto),
    );
  }

  @HttpCode(204)
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  async deleteBlog(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    return await this.commandBus.execute<DeleteBlogCommand, void>(
      new DeleteBlogCommand(id),
    );
  }
}