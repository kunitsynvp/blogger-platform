import { Controller, Get, Param } from '@nestjs/common';
import { CommentsViewDto } from './view-dto/comments-view-dto';
import { CommentsQueryRepository } from '../infrastructure/comments-query.repository';
import { CommentsService } from '../application/comments.service';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation-pipe';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsService: CommentsService,
  ) {
    this.commentsQueryRepository = commentsQueryRepository;
  }
  @Get(':commentId')
  async getCommentById(
    @Param('commentId', ObjectIdValidationPipe) commentId: string,
  ): Promise<CommentsViewDto> {
    return await this.commentsQueryRepository.findByIdOrFail(commentId);
  }
}