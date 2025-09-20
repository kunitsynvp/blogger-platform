import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class CommentatorInfo {
  @Prop({ type: mongoose.Types.ObjectId, required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  userLogin: string;
}
// @Schema()
// export class LikesInfoDb{
//   @Prop({type: Number, required: true})
//   likesCount: number;
//
//   @Prop({type: Number, required: true})
//   dislikesCount: number;
//
// }