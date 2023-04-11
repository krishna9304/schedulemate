import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from 'src/database/abstract.schema';

export type HostAvailabilityStatus = 'active' | 'inactive';

@Schema({ versionKey: false })
export class HostAvailability extends AbstractDocument {
  @Prop({ required: true })
  availability_id: string;

  @Prop({ required: true, ref: 'User' })
  host_email: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  day_start_time: string;

  @Prop({ required: true })
  day_end_time: string;

  @Prop({ required: true })
  per_slot_duration: number;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ default: new Date().toISOString() })
  created_at: string;

  @Prop({ default: new Date().toISOString() })
  updated_at: string;

  @Prop({ default: null, type: Object })
  metadata: any;
}

export const HostAvailabilitySchema =
  SchemaFactory.createForClass(HostAvailability);
