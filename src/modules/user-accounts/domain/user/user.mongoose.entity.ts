import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PasswordRecoverySchema } from './schemas/password-recovery-schema';
import { EmailConfirmationSchema } from './schemas/email-confirmation-schema';
import {
  CreateUserDomainDto,
  EmailConfirmationUserDomainDto,
  PasswordRecoveryUserDomainDto,
} from './dto/user-domain-dto';
import { HydratedDocument, Model } from 'mongoose';
import { RandomService } from '../../application/random.service';
import {
  emailConstraints,
  emailDBConstraints,
  loginConstraints,
  loginDBConstraints,
} from './constraints/user-constraints';
import { add } from 'date-fns';


@Schema({ timestamps: true })
export class UserMongoose {

  @Prop({
    type: String,
    required: true,
    maxlength: loginDBConstraints.maxLength,
    minlength: loginDBConstraints.minLength,
  })
  login: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({
    type: String,
    required: true,
    maxlength: emailDBConstraints.maxLength,
    minlength: emailDBConstraints.minLength,
  })
  email: string;

  @Prop({ type: EmailConfirmationSchema, required: true })
  emailConfirmation: EmailConfirmationSchema;

  // @Prop(NameSchema) this variant from doc. doesn't make validation for inner object
  @Prop({ type: PasswordRecoverySchema })
  passwordRecovery: PasswordRecoverySchema;

  createdAt: Date;
  updatedAt: Date;

  static createUser(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    user.checkUsersExceptions(dto);

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;

    user.emailConfirmation = {
      confirmationCode: null,
      expirationDate: null,
      isConfirmed: dto.isConfirmed,
    };
    if (!user.emailConfirmation.isConfirmed) {
      user.emailConfirmation.confirmationCode = RandomService.createUuid();
      user.emailConfirmation.expirationDate = add(new Date(), {
        hours: dto.emailConfirmationExpireInHours,
      });
    }

    user.passwordRecovery = {
      recoveryCode: null,
      expirationDate: null,
    };

    return user as UserDocument;
  }

  confirmEmail() {
    if (this.emailConfirmation.isConfirmed) {
      throw new Error('This email has already confirmed');
    }
    if (!this.emailConfirmation.expirationDate) {
      throw new Error('This confirmation code is expired');
    }
    if (this.emailConfirmation.expirationDate < new Date()) {
      throw new Error('This confirmation code is expired');
    }
    this.emailConfirmation.isConfirmed = true;
  }
  updatePassword(newPasswordHash: string) {
    if (!this.passwordRecovery.expirationDate) {
      throw new Error('This recoveryCode is expired');
    }

    if (this.passwordRecovery.expirationDate < new Date()) {
      throw new Error('This recoveryCode is expired');
    }

    this.passwordHash = newPasswordHash;
  }
  setPasswordRecovery(dto: PasswordRecoveryUserDomainDto) {
    if (dto.expirationDate < new Date()) {
      throw new Error('Invalid password recovery expiration date');
    }

    this.passwordRecovery.expirationDate = dto.expirationDate;
    this.passwordRecovery.recoveryCode = dto.recoveryCode;
  }
  updateConfirmation(dto: EmailConfirmationUserDomainDto) {
    if (this.emailConfirmation.isConfirmed) {
      throw new Error('This email has already confirmed');
    }
    this.emailConfirmation.confirmationCode = dto.confirmationCode;
    this.emailConfirmation.expirationDate = dto.expirationDate;
  }
  checkUsersExceptions(dto: CreateUserDomainDto) {
    if (
      dto.login.length > loginConstraints.maxLength ||
      dto.login.length < loginConstraints.minLength ||
      !loginConstraints.match.test(dto.login)
    ) {
      throw new Error('invalid login');
    }
    if (!emailConstraints.match.test(dto.email)) {
      throw new Error('invalid email');
    }
  }
}

export const UserSchema = SchemaFactory.createForClass(UserMongoose);

//регистрирует методы сущности в схеме
UserSchema.loadClass(UserMongoose);

//Типизация документа
export type UserDocument = HydratedDocument<UserMongoose>;

//Типизация модели + статические методы
export type UserModelType = Model<UserDocument> & typeof UserMongoose;

