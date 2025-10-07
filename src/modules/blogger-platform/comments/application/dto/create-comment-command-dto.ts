export class CreateCommentCommandDto {
  postId: number;
  userId: number;
  content: string;
  private constructor(postId: number, userId: number, content: string) {
    this.postId = postId;
    this.userId = userId;
    this.content = content;
  }
  static createDto(postId: number, userId: number,content: string) {
    return new CreateCommentCommandDto(
      postId,
      userId,
      content
    )
  }
}