import {
  CheckExceptionsCommentDomainDto,
  CreateCommentDomainDto,
  UpdateCommentDomainDto,
} from './dto/comment-domain-dtos';
import { commentConstraints } from './constraints/comment-constraints';
import { LikeStatus } from './enums/like-status-enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../posts/domain/post.entity';
import { User } from '../../../user-accounts/domain/user/user.entity';
import { CommentLike } from '../../comments-likes/domain/comments-like.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
      type: 'character varying',
      length: 600
  })
  content: string;

  @ManyToOne(type => Post, post => post.comments)
  @JoinColumn()
  post: Post;
  @Column({type : 'int'})
  postId: number;

  @ManyToOne(type => User, user => user.comments)
  @JoinColumn()
  user: User;
  @Column({type : 'int'})
  userId: number;

  @OneToMany(type => CommentLike, cl => cl.comment)
  commentLikes: CommentLike[];

  @Column({type : 'timestamp without time zone'})
  createdAt: Date;

  static createComment(dto: CreateCommentDomainDto): Comment {
    const newComment = new Comment();
    const excDto = new CheckExceptionsCommentDomainDto();
    excDto.content = dto.content;
    newComment.checkCommentsExceptions(excDto);

    newComment.content = dto.content;
    newComment.userId = dto.userId;
    newComment.postId = dto.postId;
    newComment.createdAt = new Date()

    return newComment;
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

export type CommentQueryDbType = {
  id: number;
  content: string;
  commentatorInfo: {
    userId: number,
    userLogin: string
  }
  createdAt: Date;
  likesCount: string;
  dislikesCount: string;
  myStatus: LikeStatus;
}