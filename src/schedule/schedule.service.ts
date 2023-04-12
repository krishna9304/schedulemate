import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateHostAvailabilityRequest } from './dto/create-host-availability.dto';
import * as moment from 'moment-timezone';
import { User } from 'src/users/schemas/user.schema';
import { HostAvailabilityRepository } from './repository/hostavailability.repository';
import { SlotRepository } from './repository/slot.repository';
import { randomUUID } from 'crypto';
import { HostAvailability } from './schemas/hostavailability.schema';
import { APIResponse } from 'src/app.controller';
import { UsersRepository } from 'src/users/repositories/user.repository';
import { Slot } from './schemas/slot.schema';
import { Response } from 'express';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import * as cron from 'node-cron';

@Injectable()
export class ScheduleService {
  protected readonly logger = new Logger(ScheduleService.name);
  protected readonly oauth2Client = new google.auth.OAuth2(
    this.configService.get<string>('CLIENT_ID'),
    this.configService.get<string>('CLIENT_SECRET'),
    this.configService.get<string>('BASE_URL') + '/schedule/book/slot',
  );
  constructor(
    private readonly hostAvailabiltyRepository: HostAvailabilityRepository,
    private readonly slotRepository: SlotRepository,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {
    cron.schedule('*/15 * * * *', async () => {
      this.logger.log('Checking for expired slots');
      try {
        const currentTime = moment().toDate();
        // Find all slots that have a start time less than the current time and are 'available' or 'booked'
        const slots = await this.slotRepository.find({
          slot_start_time: { $lt: currentTime },
          status: { $in: ['available', 'booked'] },
        });

        await this.slotRepository.bulkUpdateSlots(slots);
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    });

    cron.schedule('59 23 * * *', async () => {
      const currentTime = moment().toDate();
      // Find all availabilties that have a day start time less than the current time and are 'active'
      const availabilities = await this.hostAvailabiltyRepository.find({
        day_start_time: { $lt: currentTime },
        status: 'active',
      });

      await this.hostAvailabiltyRepository.bulkUpdateAvailabilties(
        availabilities,
      );
    });
  }

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

  async validateAvailabilityRequest(
    availabilityReq: CreateHostAvailabilityRequest,
  ) {
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

    // Check if there is already a schedule for the given date
    const existingSchedule = await this.hostAvailabiltyRepository.findOne({
      date: availabilityReq.date,
      host_email: availabilityReq.host_email,
    });

    if (existingSchedule) {
      throw new BadRequestException(
        'Schedule already exists for the given date',
      );
    }
  }

  async createSchedule(
    availabilityReq: CreateHostAvailabilityRequest,
    user: User,
  ) {
    await this.validateAvailabilityRequest(availabilityReq);
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

  // Get all slots for a host
  async getAvailabilities(host_email_id: string): Promise<{
    [key: string]: Slot[];
  }> {
    // checking if the host exists
    const hostExists = await this.usersRepository.exists({
      email: host_email_id,
    });

    if (!hostExists) {
      throw new BadRequestException('Invalid Host Email ID.');
    }

    const hostAvlDocs = await this.hostAvailabiltyRepository.find({
      host_email: host_email_id,
    });

    const returnVal = {};

    for (let avl of hostAvlDocs) {
      const slots = await this.slotRepository.find({
        availability_id: avl.availability_id,
      });
      returnVal[avl.date] = slots;
    }

    return returnVal;
  }

  // oauth2.0 authentication
  async authenticateGoogleUser(
    response: Response,
    slot_id: string,
  ): Promise<void> {
    const scope = 'https://www.googleapis.com/auth/calendar';
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope,
      state: slot_id,
    });

    response.redirect(url);
  }

  // book a slot
  async bookSlot(query: any) {
    const { code, state } = query;
    const slot = await this.slotRepository.findOne({ slot_id: state });
    if (!slot) {
      throw new BadRequestException('Invalid Slot ID');
    }

    if (slot.status !== 'available') {
      throw new BadRequestException('Slot is not available');
    }

    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    const availability = await this.hostAvailabiltyRepository.findOne({
      availability_id: slot.availability_id,
    });
    const host = await this.usersRepository.findOne({
      email: availability.host_email,
    });

    const calendar = google.calendar({
      version: 'v3',
      auth: this.oauth2Client,
    });

    const conference = {
      createRequest: {
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
        requestId: 'schedule-meeting',
      },
    };

    const event = {
      location: 'Virtual / Google Meet',
      start: {
        dateTime: this.formatDateToRFC3339(new Date(slot.slot_start_time)),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: this.formatDateToRFC3339(new Date(slot.slot_end_time)),
        timeZone: 'Asia/Kolkata',
      },
      description: 'Some dummy description',
      attendees: [],
      conferenceData: conference,
    };

    const { data: eventResponse } = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });

    // Extract the Google Meet link from the event response
    const meeting_link = eventResponse.hangoutLink;

    // Update the event with the Google Meet link as the location
    const { data: updatedEvent } = await calendar.events.patch({
      calendarId: 'primary',
      eventId: eventResponse.id,
      requestBody: {
        summary: availability.title + ' ' + eventResponse.creator.email,
        location: meeting_link,
        attendees: [
          {
            displayName: host.name,
            email: availability.host_email,
            organizer: true,
          },
          {
            displayName: eventResponse.creator.displayName,
            email: eventResponse.creator.email,
            organizer: false,
          },
        ],
        conferenceData: {
          ...eventResponse.conferenceData,
          entryPoints: [
            {
              entryPointType: 'video',
              uri: meeting_link,
            },
          ],
        },
      },
    });

    return await this.slotRepository.findOneAndUpdate(
      { slot_id: state },
      {
        status: 'booked',
        updated_at: new Date().toISOString(),
        meeting_link,
        attendie_email: updatedEvent.creator.email,
      },
    );
  }

  formatDateToRFC3339(dateString: Date) {
    const date = moment.utc(dateString, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    const formattedDate = date.format('YYYY-MM-DDTHH:mm:ssZZ');
    return formattedDate;
  }
}
