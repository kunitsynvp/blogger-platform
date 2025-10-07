import { LikeStatus } from '../../comments/domain/enums/like-status-enum';
import { CreatePostLikeStatusDto } from './dto/create-post-like-status-dto';

export class PostLike {
  id: number;
  userId: number;
  postId: number;
  likeStatus: LikeStatus;
  createdAt: Date;

  static createLikeStatus(dto: CreatePostLikeStatusDto): PostLike {

    const newLikeStatus = new PostLike()
    newLikeStatus.checkLikeExceptions(dto.likeStatus)

    newLikeStatus.userId = dto.userId
    newLikeStatus.postId = dto.postId
    newLikeStatus.likeStatus = dto.likeStatus
    return newLikeStatus
  }
  updateLikeStatus(newLikeStatus: LikeStatus): void {
    this.checkLikeExceptions(newLikeStatus);
    this.likeStatus = newLikeStatus
  }
  checkLikeExceptions(newStatus: LikeStatus): void {
    if(!Object.values(LikeStatus).includes(newStatus)){
      throw new Error(`invalid like status`)
    }
  }

}
export type PostLikeDbType = {
  id: number;
  userId: number;
  postId: number;
  status: LikeStatus;
  createdAt: Date;
}
