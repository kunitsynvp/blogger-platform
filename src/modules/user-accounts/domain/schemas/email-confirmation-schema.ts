import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class EmailConfirmationSchema {
  @Prop({ type: Date, nullable: true })
  expirationDate: Date | null;

  @Prop({ type: String, nullable: true })
  confirmationCode: string | null;

  @Prop({ type: Boolean, default: false })
  isConfirmed: boolean;
}
