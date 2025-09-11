import { Injectable, NotFoundException } from '@nestjs/common';
import { Blog, BlogDocument} from '../domain/blog.entity';
import type {  BlogModelType } from '../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Injectable()
export class BlogsRepository{
  constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}
  async save(blog: BlogDocument): Promise<BlogDocument> {
    return await blog.save();
  }

  async findBlogsByIdOrFail(id: string):Promise<BlogDocument> {
    const foundBlog = await this.blogModel.findOne({_id: new mongoose.Types.ObjectId(id)});
    if(!foundBlog){
      throw new NotFoundException('Blog not found');
    }
    return foundBlog
  }

  async deleteBlog(id: string): Promise<void> {

    const deletedBlog = await this.blogModel.findByIdAndDelete(id)
    if (!deletedBlog){
      throw new NotFoundException('Blog not found');
    }

  }
}