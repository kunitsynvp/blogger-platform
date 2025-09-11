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
import { UsersService } from '../application/users.service';
import { UsersQueryRepository } from '../infrastructure/users.query.repository';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { CreateUserInputDto } from './input-dto/create-user-dto';
import { UsersViewDto } from './view-dto/users-view-dto';
import { UsersQueryDto } from './input-dto/users-query-dto';
import {
  ObjectIdValidationPipe,
} from '../../../core/pipes/object-id-validation-pipe';
import { BasicAuthGuard } from '../guards/basic/basic-auth-guard';

@Controller('users')
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
  ) {}

  @Get(':id')
  async getById(@Param('id',ObjectIdValidationPipe) id: string)
    : Promise<UsersViewDto> {
    return this.usersQueryRepository.findUserByIdOrNotFoundFail(id);
  }

  @Get()
  @UseGuards(BasicAuthGuard)
  async getAll(@Query() query: UsersQueryDto)
    : Promise<PaginatedViewDto<UsersViewDto[]>> {
    return this.usersQueryRepository.findAllUsers(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() body: CreateUserInputDto): Promise<UsersViewDto> {
    const userId = await this.usersService.createUser(body, { createBySA: true });

    return this.usersQueryRepository.findUserByIdOrNotFoundFail(userId);
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id',ObjectIdValidationPipe) id: string)
    : Promise<void> {
    return this.usersService.deleteUser(id);
  }
}
