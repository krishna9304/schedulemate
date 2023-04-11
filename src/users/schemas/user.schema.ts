import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsMobilePhone } from 'class-validator';
import { AbstractDocument } from 'src/database/abstract.schema';

@Schema({ versionKey: false })
export class User extends AbstractDocument {
  @Prop({ required: true, unique: true })
  @IsEmail()
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  @IsMobilePhone('en-IN')
  primaryPhone: string;

  @Prop({ required: true })
  dateOfBirth: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ default: new Date().toISOString() })
  created_at: string;

  @Prop({ default: new Date().toISOString() })
  updated_at: string;

  @Prop({ default: null, type: Object })
  metadata: any;
}

export const UserSchema = SchemaFactory.createForClass(User);
