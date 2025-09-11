export class CreatePostDomainDto {
  title: string
  shortDescription: string
  content: string
  blogId: string
  blogName: string

  static createDto(title: string,
                   shortDescription:string,
                   content:string,
                   blogId:string,
                   blogName:string) {
    const dto = new CreatePostDomainDto()
    dto.title = title
    dto.shortDescription = shortDescription
    dto.content = content
    dto.blogId = blogId
    dto.blogName = blogName
    return dto
  }
}