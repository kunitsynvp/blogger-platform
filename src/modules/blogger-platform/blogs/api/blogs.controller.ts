import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { BlogsQueryDto } from './input-dto/blogs-query-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogsService } from '../application/blogs.service';
import { BlogsViewDto } from './view-dto/blogs-view-dto';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { CreateBlogInputDto } from './input-dto/blogs-create-dto';
import { UpdateBlogInputDto } from './input-dto/blogs-update-dto';
import { PostsQueryDto } from '../../posts/api/input-dto/posts-query-dto';
import { PostsViewDto } from '../../posts/api/view-dto/posts-view-dto';
import { PostsQueryRepository } from '../../posts/infrastructure/posts-query.repository';
import { CreatePostForBlogDto } from '../../posts/api/input-dto/create-post-for-blog-dto';
import { CreatePostDto } from '../../posts/api/input-dto/create-post-dto';
import { PostsService } from '../../posts/application/posts.service';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation-pipe';

@Controller('blogs')
export class BlogsController {
  constructor(private blogsQueryRepository: BlogsQueryRepository,
              private postsQueryRepository: PostsQueryRepository,
              private blogsService: BlogsService,
              private postsService: PostsService,) {
  }
  @Get()
  async getAllBlogs(@Query() query: BlogsQueryDto)
    : Promise<PaginatedViewDto<BlogsViewDto[]>> {
    return this.blogsQueryRepository.findAllBlogs(query);
  }
  @Post()
  async postBlog(@Body() createBlogDto: CreateBlogInputDto)
    :Promise<BlogsViewDto>{

    const createdBlogId = await this.blogsService.createBlog(createBlogDto)

    return  await this.blogsQueryRepository.findBlogsByIdOrFail(createdBlogId);
  }
  @Get(':blogId/posts')
  async getPostsForBlog(
    @Param('blogId',ObjectIdValidationPipe) blogId: string,
    @Query() query: PostsQueryDto)
    :Promise<PaginatedViewDto<PostsViewDto[]>> {
    await this.blogsQueryRepository.findBlogsByIdOrFail(blogId)
    return await this.postsQueryRepository.findAllPosts(query, blogId);
  }

  @Post(':blogId/posts')
  async createPostForBlog(@Param('blogId',ObjectIdValidationPipe) blogId: string,
                          @Body() createPostDto: CreatePostDto
  ):Promise<PostsViewDto> {
    const dto = CreatePostForBlogDto
      .createDto(createPostDto.title,createPostDto.shortDescription,createPostDto.content,blogId)
    const postId = await this.postsService.createPost(dto)
    return await this.postsQueryRepository.findByIdOrFail(postId)
  }
  @Get(':id')
  async getBlogById(@Param('id',ObjectIdValidationPipe) id: string)
    : Promise<BlogsViewDto> {
    return this.blogsQueryRepository.findBlogsByIdOrFail(id);
  }

  @HttpCode(204)
  @Put(':id')
  async putBlog(@Param('id',ObjectIdValidationPipe) id: string,
                @Body() updateBlogDto: UpdateBlogInputDto)
    :Promise<void> {
    return await this.blogsService.updateBlog(id, updateBlogDto)
  }

  @HttpCode(204)
  @Delete(':id')
  async deleteBlog(@Param('id',ObjectIdValidationPipe) id: string)
    :Promise<void> {

    return await this.blogsService.deleteBlog(id)
  }
}