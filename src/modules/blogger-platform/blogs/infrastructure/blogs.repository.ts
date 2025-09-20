import { Injectable } from '@nestjs/common';
import type { BlogModelType } from '../domain/blog.entity';
import { Blog, BlogDocument } from '../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}
  async save(blog: BlogDocument): Promise<BlogDocument> {
    return await blog.save();
  }

  async findBlogsByIdOrFail(id: string): Promise<BlogDocument> {
    const foundBlog = await this.blogModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (!foundBlog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        field: 'id',
      });
    }
    return foundBlog;
  }

  async deleteBlog(id: string): Promise<void> {
    const deletedBlog = await this.blogModel.findByIdAndDelete(id);
    if (!deletedBlog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
        field: 'id',
      });
    }
  }
}