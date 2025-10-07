import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsSqlRepository } from '../../infrastructure/posts.sql.repository';

export class DeletePostCommand {
  constructor(public id: number) {}
}
@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postsRepository: PostsSqlRepository) {}

  async execute(command: DeletePostCommand): Promise<void> {
    return await this.postsRepository.deletePostOrFail(command.id);
  }
}