import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { CreateUserInputDto } from './input-dto/create-user-dto';
import { UsersViewDto } from './view-dto/users-view-dto';
import { UsersQueryDto } from './input-dto/users-query-dto';
import { BasicAuthGuard } from '../guards/basic/basic-auth-guard';
import { CreateUserCommand } from '../application/use-cases/users/create-user-use-case';
import { DeleteUserCommand } from '../application/use-cases/users/delete-user-use-case';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserByIdOrFailQuery } from '../application/queries/users/get-user-by-id-or-fail-query';
import { GetUsersQuery } from '../application/queries/users/get-users-query';
import { CustomParseIntPipe } from '../../../core/pipes/int-transformation-pipe';

@Controller('sa/users')
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  @HttpCode(200)
  @UseGuards(BasicAuthGuard)
  async getAll(
    @Query() query: UsersQueryDto,
  ): Promise<PaginatedViewDto<UsersViewDto[]>> {
    return this.queryBus.execute<
      GetUsersQuery,
      PaginatedViewDto<UsersViewDto[]>
    >(new GetUsersQuery(query));
  }

  @Post()
  @HttpCode(201)
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() body: CreateUserInputDto): Promise<UsersViewDto> {
    const userId = await this.commandBus.execute<CreateUserCommand, number>(
      new CreateUserCommand(body),
    );

    return this.queryBus.execute<GetUserByIdOrFailQuery, UsersViewDto>(
      new GetUserByIdOrFailQuery(userId),
    );
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async deleteUser(@Param('id', CustomParseIntPipe) id: number): Promise<void> {
    return this.commandBus.execute<DeleteUserCommand, void>(
      new DeleteUserCommand(id),
    );
  }
}
