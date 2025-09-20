export class UpdateCommentCommandDto {
  commentId: string;
  userId: string;
  content: string;
  private constructor(postId: string, userId: string, content: string) {
    this.commentId = postId;
    this.userId = userId;
    this.content = content;
  }
  static createDto(commentId: string, userId: string,content: string) {
    return new UpdateCommentCommandDto(
      commentId,
      userId,
      content
    )
  }
}