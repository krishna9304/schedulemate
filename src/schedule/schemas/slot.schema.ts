import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from 'src/database/abstract.schema';

@Schema({ versionKey: false })
export class Slot extends AbstractDocument {
  @Prop({ required: true, ref: 'HostAvailability' })
  availability_id: string;

  @Prop({ required: true })
  slot_id: string;

  @Prop({ required: true })
  slot_start_time: string;

  @Prop({ required: true })
  slot_end_time: string;

  @Prop({ default: null })
  meeting_link: string | null;

  @Prop({ default: null })
  attendie_email: string | null;

  @Prop({ default: 'available' })
  status: string;

  @Prop({ default: new Date().toISOString() })
  created_at: string;

  @Prop({ default: new Date().toISOString() })
  updated_at: string;

  @Prop({ default: null, type: Object })
  metadata: any;
}

export const SlotSchema = SchemaFactory.createForClass(Slot);
