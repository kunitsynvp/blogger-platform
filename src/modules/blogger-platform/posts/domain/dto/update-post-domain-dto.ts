export class UpdatePostDomainDto {
  title:string
  shortDescription: string
  content: string
  blogId: number
  static createDto(title: string,
                   shortDescription:string,
                   content:string,
                   blogId:number,) {
    const dto = new UpdatePostDomainDto()
    dto.title = title
    dto.shortDescription = shortDescription
    dto.content = content
    dto.blogId = blogId
    return dto
  }
}