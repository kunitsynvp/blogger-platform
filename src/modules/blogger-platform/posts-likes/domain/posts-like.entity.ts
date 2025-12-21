import { LikeStatus } from '../../comments/domain/enums/like-status-enum';
import { CreatePostLikeStatusDto } from './dto/create-post-like-status-dto';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../posts/domain/post.entity';
import { User } from '../../../user-accounts/domain/user/user.entity';

@Entity()
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Post, post => post.postLikes)
  @JoinColumn()
  post: Post
  @Column({type: 'int'})
  postId: number;

  @ManyToOne(type => User, user => user.postLikes)
  @JoinColumn()
  user: User
  @Column({type: 'int'})
  userId: number;

  @Column({type: 'varchar', enum: LikeStatus})
  likeStatus: LikeStatus;

  @Column({type: 'timestamp without time zone'})
  createdAt: Date;

  static createLikeStatus(dto: CreatePostLikeStatusDto): PostLike {

    const newLikeStatus = new PostLike()
    newLikeStatus.checkLikeExceptions(dto.likeStatus)

    newLikeStatus.userId = dto.userId
    newLikeStatus.postId = dto.postId
    newLikeStatus.likeStatus = dto.likeStatus
    newLikeStatus.createdAt = new Date()
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
