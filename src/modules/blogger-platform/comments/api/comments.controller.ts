import { Body, Controller, Delete, Get, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import { CommentsViewDto } from './view-dto/comments-view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetCommentByIdOrFailQuery } from '../application/queries/get-comment-by-id-query';
import { LikeStatusDto } from '../../comments-likes/api/input-dto/like-status-input-dto';
import { CreateCommentLikeStatusDto } from '../../comments-likes/application/dto/create-comment-like-status-dto';
import { CurrentUser } from '../../../user-accounts/guards/decorators/current-user-param-decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { JwtAccessTokenAuthGuard } from '../../../user-accounts/guards/bearer/jwt-access-token-auth-guard';
import { CommentLikeStatusCommand } from '../../comments-likes/application/use-cases/comment-like-status-use-case';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth-guard';
import { OptionalCurrentUser } from '../../../user-accounts/guards/decorators/optional-current-user-param-decorator';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation-pipe';
import { UpdateCommentInputDto } from './input-dto/update-comment-input-dto';
import { UpdateCommentCommand } from '../application/use-cases/update-comment-use-case';
import { UpdateCommentCommandDto } from '../application/dto/update-comment-command-dto';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment-use-case';

@Controller('comments')
export class CommentsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}
  @Get(':commentId')
  @UseGuards(JwtOptionalAuthGuard)
  async getCommentById(
    @OptionalCurrentUser() user: UserContextDto | undefined,
    @Param('commentId', ObjectIdValidationPipe) commentId: string,
  ): Promise<CommentsViewDto> {
    return await this.queryBus.execute<
      GetCommentByIdOrFailQuery,
      CommentsViewDto
    >(new GetCommentByIdOrFailQuery(commentId,user));
  }
  @UseGuards(JwtAccessTokenAuthGuard)
  @HttpCode(204)
  @Put(':commentId/like-status')
  async likeStatus(
    @CurrentUser() user: UserContextDto,
    @Param('commentId', ObjectIdValidationPipe) commentId: string,
    @Body() dto: LikeStatusDto,
  ): Promise<void> {
    const createLikeStatusDto: CreateCommentLikeStatusDto = {
      userId: user.userId,
      commentId: commentId,
      likeStatus: dto.likeStatus,
    };
    return await this.commandBus.execute<CommentLikeStatusCommand, void>(
      new CommentLikeStatusCommand(createLikeStatusDto),
    );
  }
  @HttpCode(204)
  @UseGuards(JwtAccessTokenAuthGuard)
  @Put(':commentId')
  async putComment(@CurrentUser() user: UserContextDto,
                   @Param('commentId', ObjectIdValidationPipe) commentId: string,
                   @Body() dto: UpdateCommentInputDto):Promise<void> {
    const updateDto = UpdateCommentCommandDto.createDto(commentId, user.userId,dto.content)
    return await this.commandBus.execute<UpdateCommentCommand,void>(new UpdateCommentCommand(updateDto))
  }
  @HttpCode(204)
  @UseGuards(JwtAccessTokenAuthGuard)
  @Delete(':commentId')
  async deleteComment(@CurrentUser() user: UserContextDto,
                      @Param('commentId', ObjectIdValidationPipe) commentId: string,)
    :Promise<void>{
    return await this.commandBus.execute<
      DeleteCommentCommand,
      void>(new DeleteCommentCommand(commentId, user.userId))
  }
}