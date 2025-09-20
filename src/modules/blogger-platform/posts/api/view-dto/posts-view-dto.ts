import { PostDocument } from '../../domain/post.entity';
import { LikeStatus } from '../../../comments/domain/enums/like-status-enum';

export class PostsViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;

  static mapToView(post: PostDocument,dto:ExtendedLikesInfo): PostsViewDto {
    const newDto = new PostsViewDto();
    newDto.id = post._id.toString();
    newDto.title = post.title;
    newDto.shortDescription = post.shortDescription;
    newDto.content = post.content;
    newDto.blogId = post.blogId.toString();
    newDto.blogName = post.blogName;
    newDto.createdAt = post.createdAt.toISOString();

    newDto.extendedLikesInfo = {
      likesCount: dto.likesCount,
      dislikesCount: dto.dislikesCount,
      myStatus: dto.myStatus,
      newestLikes: dto.newestLikes,
    };
    return newDto;
  }
}
export class ExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: LikeDetailsViewDto[];
  private constructor(
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus,
    newestLikes: LikeDetailsViewDto[],
  ) {
    this.likesCount = likesCount;
    this.dislikesCount = dislikesCount;
    this.myStatus = myStatus;
    this.newestLikes = newestLikes;
  }
  static createDto(
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus,
    newestLikes: LikeDetailsViewDto[],
  ) {
    return new ExtendedLikesInfo(
      likesCount,
      dislikesCount,
      myStatus,
      newestLikes,
    );
  }
}
export type LikeDetailsViewDto = {
  addedAt: string;
  userId: string;
  login: string;
};