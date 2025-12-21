import { LikeStatus } from '../../comments/domain/enums/like-status-enum';
import { CreateCommentLikeStatusDto } from '../application/dto/create-comment-like-status-dto';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../user-accounts/domain/user/user.entity';
import { Comment } from '../../comments/domain/comment.entity';

@Entity()
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.commentLikes)
  @JoinColumn()
  user: User;
  @Column()
  userId: number

  @ManyToOne(() => Comment, (c) => c.commentLikes)
  @JoinColumn()
  comment: Comment;
  @Column()
  commentId: number

  @Column({type: 'varchar', enum: LikeStatus})
  status: LikeStatus;

  @Column({type: 'timestamp without time zone'})
  createdAt: Date;

  static createLikeStatus(dto: CreateCommentLikeStatusDto): CommentLike {
    const newLikeStatus = new CommentLike();
    newLikeStatus.checkCommentLikeExceptions(dto.likeStatus);

    newLikeStatus.userId = dto.userId;
    newLikeStatus.commentId = dto.commentId
    newLikeStatus.status = dto.likeStatus;
    newLikeStatus.createdAt = new Date();
    return newLikeStatus;
  }
  updateLikeStatus(newLikeStatus: LikeStatus): void {
    this.checkCommentLikeExceptions(newLikeStatus);
    this.status = newLikeStatus;
  }
  checkCommentLikeExceptions(newStatus: LikeStatus): void {
    if (!Object.values(LikeStatus).includes(newStatus)) {
      throw new Error(`invalid like status`);
    }
  }
}
export type CommentLikeDbType = {
  id: number;
  userId: number
  commentId: number
  likeStatus: LikeStatus;
  createdAt: Date;
}