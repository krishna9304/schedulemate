import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { AbstractDocument } from 'src/database/abstract.schema';

@Schema({ versionKey: false })
export class Slot extends AbstractDocument {
  @ApiProperty({ type: String, example: '5f9f1b9b0b9b9b0b9b0b9b0b' })
  _id: Types.ObjectId;

  @Prop({ required: true, ref: 'HostAvailability' })
  @ApiProperty()
  availability_id: string;

  @Prop({ required: true })
  @ApiProperty()
  slot_id: string;

  @Prop({ required: true })
  @ApiProperty()
  slot_start_time: string;

  @Prop({ required: true })
  @ApiProperty()
  slot_end_time: string;

  @Prop({ default: null })
  @ApiProperty()
  meeting_link: string | null;

  @Prop({ default: null })
  @ApiProperty()
  attendie_email: string | null;

  @Prop({ default: 'available' })
  @ApiProperty()
  status: string;

  @Prop({ default: new Date().toISOString() })
  @ApiProperty()
  created_at: string;

  @Prop({ default: new Date().toISOString() })
  @ApiProperty()
  updated_at: string;

  @Prop({ default: null, type: Object })
  @ApiProperty()
  metadata: any;
}

export const SlotSchema = SchemaFactory.createForClass(Slot);
