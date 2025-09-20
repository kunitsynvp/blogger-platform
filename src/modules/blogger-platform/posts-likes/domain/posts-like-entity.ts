import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { LikeStatus } from '../../comments/domain/enums/like-status-enum';
import { CreatePostLikeStatusDto } from './dto/create-post-like-status-dto';

@Schema({ timestamps: true })
export class PostLike {
  @Prop({ type: mongoose.Types.ObjectId, required: true})
  userId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId, required: true })
  postId: mongoose.Types.ObjectId;

  @Prop({ type: String, enum: LikeStatus, required: true })
  status: LikeStatus;

  @Prop({type: String, required: true})
  login: string

  createdAt: Date;
  updatedAt: Date;

  static createLikeStatus(dto: CreatePostLikeStatusDto): PostLikeDocument {

    const newLikeStatus = new this()
    newLikeStatus.checkLikeExceptions(dto.likeStatus)

    newLikeStatus.userId = new mongoose.Types.ObjectId(dto.userId)
    newLikeStatus.postId = new mongoose.Types.ObjectId(dto.postId)
    newLikeStatus.status = dto.likeStatus
    newLikeStatus.login = dto.login
    return newLikeStatus as PostLikeDocument;
  }
  updateLikeStatus(newLikeStatus: LikeStatus): void {
    this.checkLikeExceptions(newLikeStatus);
    this.status = newLikeStatus
  }
  checkLikeExceptions(newStatus: LikeStatus): void {
    if(!Object.values(LikeStatus).includes(newStatus)){
      throw new Error(`invalid like status`)
    }
  }

}
export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

//регистрирует методы сущности в схеме
PostLikeSchema.loadClass(PostLike);

//Типизация документа
export type PostLikeDocument = HydratedDocument<PostLike>;

//Типизация модели + статические методы
export type PostLikeModelType = Model<PostLikeDocument> & typeof PostLike;