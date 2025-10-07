import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreateBlogInputDto } from '../../../../src/modules/blogger-platform/blogs/api/input-dto/blogs-create-dto';
import { BlogsViewDto } from '../../../../src/modules/blogger-platform/blogs/api/view-dto/blogs-view-dto';
import { BlogsSqlRepository } from '../../../../src/modules/blogger-platform/blogs/infrastructure/blogs.sql.repository';

export class BlogsTestManager {
  private readonly BasicAuthString: string = 'Basic YWRtaW46cXdlcnR5';

  private blogsRepository: BlogsSqlRepository;

  constructor(private app: INestApplication) {
    this.blogsRepository = this.app.get<BlogsSqlRepository>(BlogsSqlRepository);
  }

  async createBlogInDb(
    name?: string,
    description?: string,
    websiteUrl?: string,
  ): Promise<BlogsViewDto> {
    const creationData: CreateBlogInputDto = {
      name: name ?? 'New blog',
      description: description ?? 'A new blog description',
      websiteUrl: websiteUrl ?? 'https://newblog.com',
    };

    const res = await request(this.app.getHttpServer())
      .post('/blogs')
      .set('Authorization', this.BasicAuthString)
      .send(creationData)
      .expect(201);

    return res.body;
  }
  async deleteBlogById(id: number): Promise<void> {
    //return await this.blogsRepository.deleteBlog(id) //TODO NORMAL TEST LOGIC
  }
}
