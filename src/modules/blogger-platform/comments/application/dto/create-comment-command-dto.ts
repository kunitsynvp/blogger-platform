export class CreateCommentCommandDto {
  postId: string;
  userId: string;
  content: string;
  private constructor(postId: string, userId: string, content: string) {
    this.postId = postId;
    this.userId = userId;
    this.content = content;
  }
  static createDto(postId: string, userId: string,content: string) {
    return new CreateCommentCommandDto(
      postId,
      userId,
      content
    )
  }
}