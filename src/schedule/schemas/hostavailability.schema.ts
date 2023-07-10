import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractDocument } from 'src/database/abstract.schema';

export type HostAvailabilityStatus = 'active' | 'inactive';

@Schema({ versionKey: false })
export class HostAvailability extends AbstractDocument {
  @Prop({ required: true })
  @ApiProperty()
  availability_id: string;

  @Prop({ required: true })
  @ApiProperty()
  title: string;

  @Prop({ required: true, ref: 'User' })
  @ApiProperty()
  host_email: string;

  @Prop({ required: true })
  @ApiProperty({ example: 'yyyy-mm-dd' })
  date: string;

  @Prop({ required: true })
  @ApiProperty({ example: 'hh:mm:ss' })
  day_start_time: string;

  @Prop({ required: true })
  @ApiProperty({ example: 'hh:mm:ss' })
  day_end_time: string;

  @Prop({ required: true })
  @ApiProperty({ example: 30 })
  per_slot_duration: number;

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

export const HostAvailabilitySchema =
  SchemaFactory.createForClass(HostAvailability);
