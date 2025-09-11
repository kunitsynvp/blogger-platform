import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PasswordRecoverySchema } from './schemas/password-recovery-schema';
import { EmailConfirmationSchema } from './schemas/email-confirmation-schema';
import {
  CreateUserDomainDto,
  CreateUserDomainOptions,
  EmailConfirmationUserDomainDto,
  PasswordRecoveryUserDomainDto,
} from './dto/user-domain-dto';
import { HydratedDocument, Model } from 'mongoose';
import { RandomService } from '../application/random.service';
import { SETTINGS } from '../../../core/settings/settings';
import {
  emailConstraints,
  emailDBConstraints,
  loginConstraints,
  loginDBConstraints,
} from './constraints/user-constraints';

//флаг timestemp автоматичеки добавляет поля upatedAt и createdAt
/**
 * User Entity Schema
 * This class represents the schema and behavior of a User entity.
 */
@Schema({ timestamps: true })
export class User {
  /**
   * Login of the user (must be uniq)
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true, maxlength: loginDBConstraints.maxLength, minlength: loginDBConstraints.minLength })
  login: string;

  /**
   * Password hash for authentication
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  passwordHash: string;

  /**
   * Email of the user
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true, maxlength: emailDBConstraints.maxLength, minlength: emailDBConstraints.minLength })
  email: string;

  /**
   * Email confirmation
   * @type {EmailConfirmationSchema}
   * @default false
   */
  @Prop({ type: EmailConfirmationSchema, required: true })
  emailConfirmation: EmailConfirmationSchema;

  // @Prop(NameSchema) this variant from doc. doesn't make validation for inner object
  @Prop({ type: PasswordRecoverySchema })
  passwordRecovery: PasswordRecoverySchema;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  static createUser(dto: CreateUserDomainDto, options?: CreateUserDomainOptions): UserDocument {
    const user = new this();
    user.checkUsersExceptions(dto)

    user.login = dto.login;
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;

    if (options?.createBySA === true) {
      user.emailConfirmation = {
        confirmationCode: null,
        expirationDate: null,
        isConfirmed: true,
      };
    }else {
      user.emailConfirmation = {
        confirmationCode: RandomService.createUuid(),
        expirationDate: SETTINGS.EMAIL_CONFIRMATION_EXP_DATE,
        isConfirmed: false,
      }
    }
    user.passwordRecovery = {
      recoveryCode: null,
      expirationDate: null,
    };

    return user as UserDocument;
  }

  /**
   * Updates the user instance with new data
   * Resets email confirmation if email is updated
   * @param {UpdateUserDto} dto - The data transfer object for user updates
   * DDD continue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
   */
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
  checkUsersExceptions(dto: CreateUserDomainDto ){
    if (dto.login.length > loginConstraints.maxLength ||
      dto.login.length < loginConstraints.minLength ||
      !loginConstraints.match.test(dto.login)) {
      throw new Error('invalid login');
    }
    if (!emailConstraints.match.test(dto.email)) {
      throw new Error('invalid email');
    }
  }

}

export const UserSchema = SchemaFactory.createForClass(User);

//регистрирует методы сущности в схеме
UserSchema.loadClass(User);

//Типизация документа
export type UserDocument = HydratedDocument<User>;

//Типизация модели + статические методы
export type UserModelType = Model<UserDocument> & typeof User;

