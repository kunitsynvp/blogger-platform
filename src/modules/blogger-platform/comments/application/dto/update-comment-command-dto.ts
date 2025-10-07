export class UpdateCommentCommandDto {
  commentId: number;
  userId: number;
  content: string;
  private constructor(postId: number, userId: number, content: string) {
    this.commentId = postId;
    this.userId = userId;
    this.content = content;
  }
  static createDto(commentId: number, userId: number,content: string) {
    return new UpdateCommentCommandDto(
      commentId,
      userId,
      content
    )
  }
}