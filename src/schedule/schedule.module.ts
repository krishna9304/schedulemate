import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { HostAvailabilityRepository } from './repository/hostavailability.repository';
import { SlotRepository } from './repository/slot.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  HostAvailability,
  HostAvailabilitySchema,
} from './schemas/hostavailability.schema';
import { Slot, SlotSchema } from './schemas/slot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HostAvailability.name, schema: HostAvailabilitySchema },
    ]),
    MongooseModule.forFeature([{ name: Slot.name, schema: SlotSchema }]),
  ],
  providers: [ScheduleService, HostAvailabilityRepository, SlotRepository],
  controllers: [ScheduleController],
})
export class ScheduleModule {}
