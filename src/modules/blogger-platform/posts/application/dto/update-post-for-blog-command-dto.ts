export class UpdatePostForBlogCommandDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  postId: number;

  private constructor(title: string,shortDescription: string, content: string, blogId: number,postId: number) {
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.postId = postId;
  }
  static createDto(title: string,shortDescription: string, content: string, blogId: number,postId: number) {
    return new UpdatePostForBlogCommandDto(
      title,
      shortDescription,
      content,
      blogId,
      postId);
  }
}
