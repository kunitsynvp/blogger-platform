import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../posts/domain/post.entity';
import type { CommentModelType } from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(Post.name) private commentModel: CommentModelType) {}

}