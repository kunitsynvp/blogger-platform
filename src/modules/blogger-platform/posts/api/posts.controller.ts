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
} from '@nestjs/common';
import { CommentsQueryDto } from '../../comments/api/input-dto/comments-query-dto';
import { CommentsQueryRepository } from '../../comments/infrastructure/comments-query.repository';
import { PostsQueryDto } from './input-dto/posts-query-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommentsViewDto } from '../../comments/api/view-dto/comments-view-dto';
import { PostsViewDto } from './view-dto/posts-view-dto';
import { PostsQueryRepository } from '../infrastructure/posts-query.repository';
import { CreatePostForBlogDto } from './input-dto/create-post-for-blog-dto';
import { PostsService } from '../application/posts.service';
import { UpdatePostDto } from './input-dto/update-post-dto';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation-pipe';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':postId/comments')
  async getCommentsForPost(
    @Param('postId', ObjectIdValidationPipe) postId: string,
    @Query() query: CommentsQueryDto,
  ): Promise<PaginatedViewDto<CommentsViewDto[]>> {
    return await this.commentsQueryRepository.findAllComments(query, postId);
  }

  @Get()
  async getPosts(
    @Query() query: PostsQueryDto,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    return await this.postsQueryRepository.findAllPosts(query);
  }

  @Post()
  async createPost(@Body() dto: CreatePostForBlogDto): Promise<PostsViewDto> {
    const postId: string = await this.postsService.createPost(dto);
    return await this.postsQueryRepository.findByIdOrFail(postId);
  }

  @Get(':postId')
  async getPost(
    @Param('postId', ObjectIdValidationPipe) postId: string,
  ): Promise<PostsViewDto> {
    return await this.postsQueryRepository.findByIdOrFail(postId);
  }

  @HttpCode(204)
  @Put(':postId')
  async putPost(
    @Param('postId', ObjectIdValidationPipe) postId: string,
    @Body() dto: UpdatePostDto,
  ): Promise<void> {
    return await this.postsService.updatePost(postId, dto);
  }

  @HttpCode(204)
  @Delete(':postId')
  async deletePost(
    @Param('postId', ObjectIdValidationPipe) postId: string,
  ): Promise<void> {
    return await this.postsService.deletePost(postId);
  }
}