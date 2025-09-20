import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { LikeStatus } from '../../comments/domain/enums/like-status-enum';
import { CreateCommentLikeStatusDto } from '../application/dto/create-comment-like-status-dto';

@Schema({ timestamps: true })
export class CommentLike {
  @Prop({ type: mongoose.Types.ObjectId, required: true})
  userId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, required: true })
  commentId: mongoose.Types.ObjectId;

  @Prop({ type: String, enum: LikeStatus, required: true })
  status: LikeStatus;

  createdAt: Date;
  updatedAt: Date;

  static createLikeStatus(dto: CreateCommentLikeStatusDto): CommentLikeDocument {

    const newLikeStatus = new this()
    newLikeStatus.checkCommentLikeExceptions(dto.likeStatus)

    newLikeStatus.userId = new mongoose.Types.ObjectId(dto.userId)
    newLikeStatus.commentId = new mongoose.Types.ObjectId(dto.commentId)
    newLikeStatus.status = dto.likeStatus
    return newLikeStatus as CommentLikeDocument;
  }
  updateLikeStatus(newLikeStatus: LikeStatus):void{
    this.checkCommentLikeExceptions(newLikeStatus);
    this.status = newLikeStatus
  }
  checkCommentLikeExceptions(newStatus: LikeStatus): void {
    if(!Object.values(LikeStatus).includes(newStatus)){
      throw new Error(`invalid like status`)
    }
  }

}
export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

//регистрирует методы сущности в схеме
CommentLikeSchema.loadClass(CommentLike);

//Типизация документа
export type CommentLikeDocument = HydratedDocument<CommentLike>;

//Типизация модели + статические методы
export type CommentLikeModelType = Model<CommentLikeDocument> & typeof CommentLike;