import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSqlRepository } from '../../infrastructure/blogs.sql.repository';

export class DeleteBlogCommand {
  constructor(public id: number) {}
}
@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogsRepository: BlogsSqlRepository) {}
  async execute(command: DeleteBlogCommand): Promise<void> {
    return await this.blogsRepository.deleteBlogOrFail(command.id);
  }
}