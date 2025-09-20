import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentatorInfo } from './schemas/schemas';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import {
  CheckExceptionsCommentDomainDto,
  CreateCommentDomainDto,
  UpdateCommentDomainDto,
} from './dto/comment-domain-dtos';
import {
  commentConstraints,
  commentDBConstraints,
} from './constraints/comment-constraints';

@Schema({ timestamps: true })
export class Comment {
  @Prop({
    type: String,
    required: true,
    minlength: commentDBConstraints.minContentLength,
    maxlength: commentDBConstraints.maxContentLength,
  })
  content: string;
  @Prop({ type: mongoose.Types.ObjectId, required: true })
  postId: mongoose.Types.ObjectId;

  @Prop({ type: CommentatorInfo, required: true })
  commentatorInfo: CommentatorInfo;

  // @Prop({type: LikesInfoDb, required: true})
  // likesInfo: LikesInfoDb
  @Prop({ type: Number, required: true })
  likesCount: number;

  @Prop({ type: Number, required: true })
  dislikesCount: number;

  createdAt: Date;
  updatedAt: Date;

  static createComment(dto: CreateCommentDomainDto): CommentDocument {
    const newComment = new this();
    const excDto = new CheckExceptionsCommentDomainDto();
    excDto.content = dto.content;
    newComment.checkCommentsExceptions(excDto);

    newComment.content = dto.content;
    newComment.commentatorInfo = {
      userId: new mongoose.Types.ObjectId(dto.userId),
      userLogin: dto.userLogin,
    };
    newComment.postId = new mongoose.Types.ObjectId(dto.postId);
    newComment.likesCount = 0;
    newComment.dislikesCount = 0;

    return newComment as CommentDocument;
  }
  updateComment(dto: UpdateCommentDomainDto): void {
    const checkExcDto = new CheckExceptionsCommentDomainDto();
    checkExcDto.content = dto.content;

    this.checkCommentsExceptions(checkExcDto);
    this.content = dto.content;
  }
  checkCommentsExceptions(dto: CheckExceptionsCommentDomainDto) {
    if (
      dto.content.length < commentConstraints.minContentLength ||
      dto.content.length > commentConstraints.maxContentLength
    ) {
      throw new Error('invalid comment content');
    }
  }
}
export const CommentSchema = SchemaFactory.createForClass(Comment);

//регистрирует методы сущности в схеме
CommentSchema.loadClass(Comment);

//Типизация документа
export type CommentDocument = HydratedDocument<Comment>;

//Типизация модели + статические методы
export type CommentModelType = Model<CommentDocument> & typeof Comment;