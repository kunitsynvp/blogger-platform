export class CreateCommentDomainDto{
  content: string
  userId: string
  userLogin: string
  postId: string
}
export class UpdateCommentDomainDto{
  content: string
}
export class CheckExceptionsCommentDomainDto{
  content: string
}