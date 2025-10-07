import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryDto } from '../../comments/api/input-dto/comments-query-dto';
import { PostsQueryDto } from './input-dto/posts-query-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommentsViewDto } from '../../comments/api/view-dto/comments-view-dto';
import { PostsViewDto } from './view-dto/posts-view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetCommentsForPostQuery } from '../../comments/application/queries/get-comments-for-post-query';
import { GetPostsQuery } from '../application/queries/get-posts-query';
import { GetPostByIdOrFailQuery } from '../application/queries/get-post-by-id-or-fail-query';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth-guard';
import { OptionalCurrentUser } from '../../../user-accounts/guards/decorators/optional-current-user-param-decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { CreateCommentInputDto } from '../../comments/api/input-dto/create-comment-input-dto';
import { JwtAccessTokenAuthGuard } from '../../../user-accounts/guards/bearer/jwt-access-token-auth-guard';
import { CurrentUser } from '../../../user-accounts/guards/decorators/current-user-param-decorator';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment-use-case';
import { CreateCommentCommandDto } from '../../comments/application/dto/create-comment-command-dto';
import { GetCommentByIdOrFailQuery } from '../../comments/application/queries/get-comment-by-id-query';
import { LikeStatusDto } from '../../comments-likes/api/input-dto/like-status-input-dto';
import { PostLikeStatusCommand } from '../../posts-likes/application/use-cases/post-like-status-use-case';
import { CreatePostLikeCommandDto } from '../../posts-likes/application/dto/create-post-like-command-dto';
import { CustomParseIntPipe } from '../../../../core/pipes/int-transformation-pipe';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get(':postId/comments')
  @UseGuards(JwtOptionalAuthGuard)
  async getCommentsForPost(
    @Param('postId', CustomParseIntPipe) postId: number,
    @Query() query: CommentsQueryDto,
    @OptionalCurrentUser() user: UserContextDto,
  ): Promise<PaginatedViewDto<CommentsViewDto[]>> {
    return await this.queryBus.execute<
      GetCommentsForPostQuery,
      PaginatedViewDto<CommentsViewDto[]>
    >(new GetCommentsForPostQuery(query, postId, user?.userId));
  }

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getPosts(
    @Query() query: PostsQueryDto,
    @OptionalCurrentUser() user: UserContextDto,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return await this.queryBus.execute<
      GetPostsQuery,
      PaginatedViewDto<PostsViewDto[]>
    >(new GetPostsQuery(query, user?.userId));
  }

  // @Post()
  // @UseGuards(BasicAuthGuard)
  // async createPost(@Body() dto: CreatePostForBlogDto): Promise<PostsViewDto> {
  //   const postId: string = await this.commandBus.execute<
  //     CreatePostCommand,
  //     string
  //   >(new CreatePostCommand(dto));
  //   return await this.queryBus.execute<GetPostByIdOrFailQuery, PostsViewDto>(
  //     new GetPostByIdOrFailQuery(postId),
  //   );
  // }

  @Post(':postId/comments')
  @UseGuards(JwtAccessTokenAuthGuard)
  @HttpCode(201)
  async createCommentForPost(
    @Body() dto: CreateCommentInputDto,
    @Param('postId', CustomParseIntPipe) postId: number,
    @CurrentUser() user: UserContextDto,
  ): Promise<CommentsViewDto> {
    const commandDto = CreateCommentCommandDto.createDto(
      postId,
      user.userId,
      dto.content,
    );
    const commentId = await this.commandBus.execute<
      CreateCommentCommand,
      number
    >(new CreateCommentCommand(commandDto));
    return await this.queryBus.execute<
      GetCommentByIdOrFailQuery,
      CommentsViewDto
    >(new GetCommentByIdOrFailQuery(commentId));
  }

  @Get(':postId')
  @UseGuards(JwtOptionalAuthGuard)
  async getPost(
    @Param('postId', CustomParseIntPipe) postId: number,
    @OptionalCurrentUser() user: UserContextDto,
  ): Promise<PostsViewDto> {
    return await this.queryBus.execute<GetPostByIdOrFailQuery, PostsViewDto>(
      new GetPostByIdOrFailQuery(postId, user?.userId),
    );
  }

  // @HttpCode(204)
  // @Put(':postId')
  // @UseGuards(BasicAuthGuard)
  // async putPost(
  //   @Param('postId', ObjectIdValidationPipe) postId: string,
  //   @Body() dto: UpdatePostDto,
  // ): Promise<void> {
  //   return await this.commandBus.execute<UpdatePostCommand, void>(
  //     new UpdatePostCommand(postId, dto),
  //   );
  // }

  @Put(':postId/like-status')
  @UseGuards(JwtAccessTokenAuthGuard)
  @HttpCode(204)
  async likePost(
    @CurrentUser() user: UserContextDto,
    @Param('postId', CustomParseIntPipe) postId: number,
    @Body() dto: LikeStatusDto,
  ): Promise<void> {
    const commandDto = CreatePostLikeCommandDto.createDto(
      postId,
      user.userId,
      dto.likeStatus,
    );
    return await this.commandBus.execute<PostLikeStatusCommand, void>(
      new PostLikeStatusCommand(commandDto),
    );
  }

  // @HttpCode(204)
  // @UseGuards(BasicAuthGuard)
  // @Delete(':postId')
  // async deletePost(
  //   @Param('postId', ObjectIdValidationPipe) postId: string,
  // ): Promise<void> {
  //   return await this.commandBus.execute<DeletePostCommand, void>(
  //     new DeletePostCommand(postId),
  //   );
  // }
}