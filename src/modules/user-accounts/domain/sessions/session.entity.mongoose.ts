import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { CreateSessionDomainDto } from './dto/create-session-domain-dto';

/**
 * User Entity Schema
 * This class represents the schema and behavior of a User entity.
 */
@Schema({ timestamps: true })
export class SessionMongoose {
  /**
   * Login of the user (must be uniq)
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  ip: string;

  /**
   * Password hash for authentication
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  title: string;

  /**
   * Email of the user
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  deviceId: string;

  /**
   * Email confirmation
   * @type {EmailConfirmationSchema}
   * @default false
   */
  @Prop({ type: mongoose.Types.ObjectId, required: true })
  userId: mongoose.Types.ObjectId;


  // @Prop(NameSchema) this variant from doc. doesn't make validation for inner object
  @Prop({ type: String, required: true })
  lastActiveDate: string;

  @Prop({ type: String, required: true })
  exp: string;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  static createSession(dto: CreateSessionDomainDto): SessionDocument {
    const session = new this();

    session.ip = dto.ip;
    session.title = dto.title;
    session.userId = new mongoose.Types.ObjectId(dto.userId);
    session.deviceId = dto.deviceId;
    //session.lastActiveDate = dto.iat;
    //session.exp = dto.exp;

    return session as SessionDocument;
  }
  updateActiveSession(newIat: string, newExp: string){
    this.lastActiveDate = newIat
    this.exp = newExp
  }

}

export const SessionSchema = SchemaFactory.createForClass(SessionMongoose);

//регистрирует методы сущности в схеме
SessionSchema.loadClass(SessionMongoose);

//Типизация документа
export type SessionDocument = HydratedDocument<SessionMongoose>;

//Типизация модели + статические методы
export type SessionModelType = Model<SessionDocument> & typeof SessionMongoose;

