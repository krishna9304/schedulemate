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
import { UsersRepository } from 'src/users/repositories/user.repository';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HostAvailability.name, schema: HostAvailabilitySchema },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        CLIENT_ID: Joi.string().required(),
        CLIENT_SECRET: Joi.string().required(),
        BASE_URL: Joi.string().required(),
        API_KEY: Joi.string().required(),
      }),
      envFilePath: '.env',
    }),
    MongooseModule.forFeature([{ name: Slot.name, schema: SlotSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    ScheduleService,
    HostAvailabilityRepository,
    SlotRepository,
    UsersRepository,
  ],
  controllers: [ScheduleController],
})
export class ScheduleModule {}
