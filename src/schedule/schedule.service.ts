import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateHostAvailabilityRequest } from './dto/create-host-availability.dto';
import * as moment from 'moment-timezone';
import { User } from 'src/users/schemas/user.schema';
import { HostAvailabilityRepository } from './repository/hostavailability.repository';
import { SlotRepository } from './repository/slot.repository';
import { randomUUID } from 'crypto';
import { HostAvailability } from './schemas/hostavailability.schema';
import { APIResponse } from 'src/app.controller';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly hostAvailabiltyRepository: HostAvailabilityRepository,
    private readonly slotRepository: SlotRepository,
  ) {}

  parseTimeStrings(
    availabilityReq: CreateHostAvailabilityRequest,
  ): CreateHostAvailabilityRequest {
    // Convert the date to a Moment.js object
    const date = moment(availabilityReq.date, 'YYYY-MM-DD');

    // Convert the start time to a Moment.js object
    const startTime = moment(date);
    startTime.set({
      hour: parseInt(availabilityReq.day_start_time.slice(0, 2)),
      minute: parseInt(availabilityReq.day_start_time.slice(3, 5)),
      second: 0,
      millisecond: 0,
    });

    // Convert the end time to a Moment.js object
    const endTime = moment(date);
    endTime.set({
      hour: parseInt(availabilityReq.day_end_time.slice(0, 2)),
      minute: parseInt(availabilityReq.day_end_time.slice(3, 5)),
      second: 0,
      millisecond: 0,
    });

    availabilityReq.date = date.toString();
    availabilityReq.day_start_time = startTime.toString();
    availabilityReq.day_end_time = endTime.toString();

    return availabilityReq;
  }

  validateAvailabilityRequest(availabilityReq: CreateHostAvailabilityRequest) {
    // Parse the time strings
    availabilityReq = this.parseTimeStrings(availabilityReq);

    // Check if the start time is before the end time
    if (
      moment(new Date(availabilityReq.day_start_time)).isSameOrAfter(
        moment(new Date(availabilityReq.day_end_time)),
      )
    ) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Check if the per slot duration is a multiple of 15 minutes
    if (availabilityReq.per_slot_duration % 15 !== 0) {
      throw new BadRequestException(
        'Per slot duration must be a multiple of 15 minutes',
      );
    }

    // Check if the per slot duration is less than the total duration
    const totalDuration = moment
      .duration(
        moment(new Date(availabilityReq.day_end_time)).diff(
          moment(new Date(availabilityReq.day_start_time)),
        ),
      )
      .asMinutes();
    if (availabilityReq.per_slot_duration > totalDuration) {
      throw new BadRequestException(
        'Per slot duration must be less than the total duration of the day',
      );
    }

    // Check if the date is in the future
    if (moment(new Date(availabilityReq.date)).isBefore(moment(new Date()))) {
      throw new BadRequestException('Date must be in the future');
    }
  }

  async createSchedule(
    availabilityReq: CreateHostAvailabilityRequest,
    user: User,
  ) {
    this.validateAvailabilityRequest(availabilityReq);
    const avl_doc: HostAvailability =
      await this.hostAvailabiltyRepository.create({
        ...availabilityReq,
        host_email: user.email,
        availability_id: `avl${randomUUID().slice(0, 8)}${randomUUID().slice(
          -8,
        )}`,
      });

    const totalDuration = moment
      .duration(
        moment(new Date(availabilityReq.day_end_time)).diff(
          moment(new Date(availabilityReq.day_start_time)),
        ),
      )
      .asMinutes();

    const slots = totalDuration / availabilityReq.per_slot_duration;

    let allSlots = [];
    for (let i = 0; i < slots; i++) {
      const startTime = moment(new Date(availabilityReq.day_start_time)).add(
        i * availabilityReq.per_slot_duration,
        'minutes',
      );
      const endTime = moment(new Date(availabilityReq.day_start_time)).add(
        (i + 1) * availabilityReq.per_slot_duration,
        'minutes',
      );
      allSlots.push({
        availability_id: avl_doc.availability_id,
        slot_id: `slot${randomUUID().slice(0, 8) + i}${randomUUID().slice(-8)}`,
        slot_start_time: startTime.toString(),
        slot_end_time: endTime.toString(),
      });
    }

    // bulk insert all slots at once
    return this.slotRepository.bulkInsert(allSlots);
  }

  // Delete a slot
  async deleteSlot(slot_id: string, user: User): Promise<APIResponse> {
    const slotExists = await this.slotRepository.exists({ slot_id });

    if (!slotExists) {
      throw new BadRequestException('Invalid Slot ID.');
    }

    const slot = await this.slotRepository.findOne({ slot_id });

    if (slot.status !== 'available') {
      throw new BadRequestException('Slot is not available to delete');
    }

    const hostAvlDoc = await this.hostAvailabiltyRepository.findOne({
      availability_id: slot.availability_id,
    });

    if (hostAvlDoc.host_email === user.email) {
      await this.slotRepository.deleteOne(slot_id);
      return {
        message: 'Slot deleted successfully',
        code: 200,
        errors: [],
      };
    } else {
      throw new BadRequestException(
        'You are not authorized to delete this slot',
      );
    }
  }
}
