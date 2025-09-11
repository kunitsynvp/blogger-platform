export class UpdatePostDomainDto {
  title:string
  shortDescription: string
  content: string
  blogId: string
  blogName:string
  static createDto(title: string,
                   shortDescription:string,
                   content:string,
                   blogId:string,
                   blogName:string) {
    const dto = new UpdatePostDomainDto()
    dto.title = title
    dto.shortDescription = shortDescription
    dto.content = content
    dto.blogId = blogId
    dto.blogName = blogName
    return dto
  }
}