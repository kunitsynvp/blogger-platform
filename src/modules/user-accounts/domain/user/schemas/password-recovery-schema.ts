import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class PasswordRecoverySchema {
  @Prop({ type: String, nullable: true })
  recoveryCode: string | null;

  @Prop({ type: Date, nullable: true })
  expirationDate: Date | null;
}
