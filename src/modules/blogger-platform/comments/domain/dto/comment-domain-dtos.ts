export class CreateCommentDomainDto{
  content: string
  userId: number
  postId: number
}
export class UpdateCommentDomainDto{
  content: string
}
export class CheckExceptionsCommentDomainDto{
  content: string
}