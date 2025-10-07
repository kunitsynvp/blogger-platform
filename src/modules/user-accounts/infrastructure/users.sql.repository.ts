import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import {
  User,
  UserCompoundDbType,
  UserDbType,
} from '../domain/user/user.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersSqlRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async createUser(user: User): Promise<number> {
    const wrappedUserId: [{id: number}] = await this.dataSource.query(
      `
        INSERT INTO "Users"(login,"passwordHash",email,"createdAt")
        VALUES ($1,$2,$3,$4)
        RETURNING id
        `,
      [
        user.login,
        user.passwordHash,
        user.email,
        user.createdAt
      ]
    )
    const userId = wrappedUserId[0].id

    await this.dataSource.query(
      `
      INSERT INTO "EmailConfirmation"("confirmationCode","expirationDate","isConfirmed","userId")
      VALUES ($1,$2,$3,$4)
      `,
      [
        user.confirmationCode,
        user.confirmationExpDate,
        user.isConfirmed,
        userId
      ]
    )
    await this.dataSource.query(
      `
      INSERT INTO "PasswordRecovery"("recoveryCode","expirationDate","userId")
      VALUES ($1,$2,$3)
      `,
      [
        user.recoveryCode,
        user.recoveryExpDate,
        userId
      ]
    )
    return userId

  }
  async updateConfirmationCode(user: User): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE "ConfirmationCode" 
      SET "confirmationCode" = $1,
      "confirmationExpDate" = $2
      WHERE "userId" = $3
        `,
      [user.confirmationCode,user.confirmationExpDate, user.id]
    )
  }
  async confirmUser(user: User): Promise<void> {
    await this.dataSource.query(
      `
      UPDATE "EmailConfirmation" 
      SET "isConfirmed" = $1
      WHERE "userId" = $2
      `,
      [user.isConfirmed,user.id]
    )
  }
  async setPasswordRecovery(user: User): Promise<void> {
    await this.dataSource.query(
      `UPDATE "PaswordRecovery" 
      SET "expirationDate" = $1,
          "recoveryCode" = $2
       WHERE "userId" = $3
      `,
      [user.recoveryExpDate,user.recoveryCode,user.id]
    )
  }
  async updatePassword(user: User): Promise<void> {
    const result = await this.dataSource.query(
      `
      UPDATE "Users" 
      SET "passwordHash" = $1
      WHERE id = $2
      `,
      [user.passwordHash, user.id]
    )
  }
  async findByIdOrFail(id: number): Promise<User> {
    const user: UserCompoundDbType[] = await this.dataSource.query(
      `
         SELECT * FROM "Users" u
         JOIN "EmailConfirmation" ec
            ON u.id = ec."userId"
         JOIN "PasswordRecovery" pr
            ON u.id = pr."userId"
         WHERE id = $1
         `,
      [id]);
    if (user.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        field: 'none',
      });
    }
    return plainToInstance(User,user[0]);
  }
  async findById(id: number): Promise<User | null> {
    const foundUser: UserCompoundDbType[] = await this.dataSource.query(
      `
        SELECT * FROM "Users" u
        JOIN "EmailConfirmation" ec
          ON u.id = ec."userId"
        JOIN "PasswordRecovery" pr
          ON u.id = pr."userId"
        WHERE u.id = $1
        `,
      [id]
    );
    if (foundUser.length === 0) {
      return null
    }
    return plainToInstance(User,foundUser[0])
  }
  async findByIdOrUnauthorizedFail(id: number): Promise<User> {
    const user: UserDbType[] = await this.dataSource.query(
      `
        SELECT * FROM "Users" u
        JOIN "EmailConfirmation" ec
            ON u.id = ec."userId"
        JOIN "PasswordRecovery" pr
            ON u.id = pr."userId"
        WHERE id = $1
        `,
      [id]
      );
    if (user.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
        field: 'None',
      });
    }
    return plainToInstance(User,user[0])
  }

  // async findByField( //TODO return in the future logic
  //   field: UsersSqlFields,
  //   value: any,
  // ): Promise<User | null> {
  //   const users: UserDbType[] = await this.dataSource.query(
  //     `SELECT * FROM "Users" WHERE $1 = $2`,
  //     [field, value],
  //   );
  //
  //   if(users.length === 0) {
  //     return null
  //   }
  //   return plainToInstance(User,users[0])
  // }
  async findByConfirmationCode(confirmationCode: string): Promise<User | null> {
    const user: UserCompoundDbType[] = await this.dataSource.query(
      `
        SELECT * FROM "Users" u
        JOIN "EmailConfirmation" ec
          ON u.id = ec."userId"
        JOIN "PasswordRecovery" pr
          ON u.id = pr."userId"
        WHERE "confirmationCode" = $1
            `,
      [confirmationCode],
    );
    if(user.length === 0) {
      return null
    }
    return plainToInstance(User,user[0])
  }
  async findByLogin(login: string): Promise<User | null> {
    const user: UserCompoundDbType[] = await this.dataSource.query(
      `
        SELECT * FROM "Users" u
        JOIN "EmailConfirmation" ec
          ON u.id = ec."userId"
        JOIN "PasswordRecovery" pr
          ON u.id = pr."userId"
        WHERE login = $1
      `,
      [login],
    );

    if(user.length === 0) {
      return null
    }
    return plainToInstance(User,user[0])
  }
  async findByEmail(email: string): Promise<User | null> {
    const user: UserDbType[] = await this.dataSource.query(
      `
        SELECT * FROM "Users" u
        JOIN "EmailConfirmation" ec
          ON u.id = ec."userId"
        JOIN "PasswordRecovery" pr
          ON u.id = pr."userId"
        WHERE email = $1
      `,
      [email],
    );
    if(user.length === 0) {
      return null
    }
    return plainToInstance(User,user[0])
  }

  async findByRecoveryCode(recoveryCode: string): Promise<User | null> {
    const user: UserDbType[] = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE "recoveryCode" = $1`,
      [recoveryCode],
    );

    if(user.length === 0) {
      return null
    }
    return plainToInstance(User,user[0])
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {

    const user: UserDbType[] =  await this.dataSource.query(
      `SELECT * FROM "Users" WHERE email = $1 OR login = $1`,
      [loginOrEmail]
    )
    if (user.length === 0) {
      return null
    }
    return plainToInstance(User,user[0])
  }

  async deleteOrFail(id: number): Promise<void> {
    const foundUser:UserDbType[] = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE id = $1`,
      [id]
    )
    if (foundUser.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
        field: 'none',
      });
    }
    await this.dataSource.query(`
      DELETE FROM "Sessions"
      WHERE "userId" = $1
    `,[id])
    await this.dataSource.query(`
      DELETE FROM "CommentLikes"
      WHERE "userId" = $1
    `,[id])
    await this.dataSource.query(`
      DELETE FROM "PostLikes"
      WHERE "userId" = $1
    `,[id])
    await this.dataSource.query(`
      DELETE FROM "Comments"
      WHERE "userId" = $1
    `,[id])
    await this.dataSource.query(
      `
      DELETE FROM "Users" 
      WHERE id = $1`,
      [id]
    )
  }
}
