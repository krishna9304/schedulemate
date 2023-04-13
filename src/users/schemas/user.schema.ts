import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMobilePhone } from 'class-validator';
import { Types } from 'mongoose';
import { AbstractDocument } from 'src/database/abstract.schema';

@Schema({ versionKey: false })
export class User extends AbstractDocument {
  @ApiProperty({
    example: '604f67f936a7db136c734d77',
    description: 'The unique identifier for the user',
  })
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  @IsEmail()
  @ApiProperty()
  email: string;

  @Prop({ required: true })
  @ApiProperty()
  name: string;

  @Prop({ required: true })
  @ApiProperty()
  gender: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  @IsMobilePhone('en-IN')
  @ApiProperty()
  primaryPhone: string;

  @Prop({ required: true })
  @ApiProperty()
  dateOfBirth: string;

  @Prop({ default: 'active' })
  @ApiProperty()
  status: string;

  @Prop({ default: new Date().toISOString() })
  @ApiProperty()
  created_at: string;

  @Prop({ default: new Date().toISOString() })
  @ApiProperty()
  updated_at: string;

  @Prop({ default: null, type: Object })
  metadata: any;
}

export const UserSchema = SchemaFactory.createForClass(User);
