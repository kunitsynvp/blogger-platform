import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { LikeStatus } from '../enums/like-status-enum';

@Schema()
export class CommentatorInfo{
  @Prop({ type: mongoose.Types.ObjectId , required: true})
  userId:  mongoose.Types.ObjectId

  @Prop({ type:String, required: true })
  userLogin: string

}
@Schema()
export class LikesInfo{
  @Prop({type: Number, required: true})
  likesCount: number;

  @Prop({type: Number, required: true})
  dislikesCount: number;

  @Prop({type: String, enum: LikeStatus, required: true})
  status: LikeStatus;
}