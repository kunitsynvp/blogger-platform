import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { CreateUserInputDto } from './input-dto/create-user-dto';
import { UsersViewDto } from './view-dto/users-view-dto';
import { UsersQueryDto } from './input-dto/users-query-dto';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation-pipe';
import { BasicAuthGuard } from '../guards/basic/basic-auth-guard';
import { CreateUserCommand } from '../application/use-cases/users/create-user-use-case';
import { DeleteUserCommand } from '../application/use-cases/users/delete-user-use-case';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserByIdOrFailQuery } from '../application/queries/users/get-user-by-id-or-fail-query';
import { GetUsersQuery } from '../application/queries/users/get-users-query';

@Controller('users')
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get(':id')
  async getById(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<UsersViewDto> {
    return this.queryBus.execute<GetUserByIdOrFailQuery, UsersViewDto>(
      new GetUserByIdOrFailQuery(id),
    );
  }

  @Get()
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
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() body: CreateUserInputDto): Promise<UsersViewDto> {
    const userId = await this.commandBus.execute<CreateUserCommand, string>(
      new CreateUserCommand(body),
    );

    return this.queryBus.execute<
      GetUserByIdOrFailQuery,
      UsersViewDto>(new GetUserByIdOrFailQuery(userId));
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    return this.commandBus.execute<DeleteUserCommand, void>(
      new DeleteUserCommand(id),
    );
  }
}
