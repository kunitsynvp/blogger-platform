import { Injectable } from '@nestjs/common';
import { UserDocument } from '../domain/user/user.entity';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async save(user: UserDocument): Promise<UserDocument> {
    return await user.save();
  }

  async findUsers(): Promise<UserDocument> {
    const result = await this.dataSource.query('SELECT * FROM "Users"');
    return result;
  }
  async findById(id: string): Promise<UserDocument> {
    const result = await this.dataSource.query(
      'SELECT * FROM "Users"' + `WHERE id = ${id}`,
    );
    return result;
  }
  // async findByIdOrUnauthorizedFail(id: string): Promise<UserDocument> {
  //   const user = await this.UserModel.findById(id);
  //   if (!user) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.Unauthorized,
  //       message: 'Unauthorized',
  //       field: 'None',
  //     });
  //   }
  //   return user;
  // }
  // async findById(id: string): Promise<UserDocument | null> {
  //   return await this.UserModel.findById(id);
  // }
  // async findByField(
  //   field: UsersFields,
  //   value: any,
  // ): Promise<UserDocument | null> {
  //   return await this.UserModel.findOne({ [field]: value });
  // }
  // async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
  //   return await this.UserModel.findOne({
  //     $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
  //   });
  // }
  //
  // async deleteOrFail(id: string): Promise<void> {
  //   const deletedUser = await this.UserModel.findByIdAndDelete(id);
  //   if (!deletedUser) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.NotFound,
  //       message: 'User not found',
  //       field: 'none',
  //     });
  //   }
  // }
}
