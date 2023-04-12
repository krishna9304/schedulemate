import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/users/current-user.decorator';
import { User } from 'src/users/schemas/user.schema';
import { ScheduleService } from './schedule.service';
import { CreateHostAvailabilityRequest } from './dto/create-host-availability.dto';
import { Request, Response } from 'express';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  createSchedule(
    @CurrentUser() user: User,
    @Body() request: CreateHostAvailabilityRequest,
  ) {
    return this.scheduleService.createSchedule(request, user);
  }

  @Delete('slot/:slot_id')
  @UseGuards(JwtAuthGuard)
  deleteSlot(@CurrentUser() user: User, @Param('slot_id') slot_id: any) {
    return this.scheduleService.deleteSlot(slot_id, user);
  }

  @Get('availability/:host_email_id')
  getAvailability(@Param('host_email_id') host_email_id: any) {
    return this.scheduleService.getAvailabilities(host_email_id);
  }

  @Get('book/:slot_id/authenticate')
  bookSlotAuthentication(
    @Res() res: Response,
    @Param('slot_id') slot_id: string,
  ) {
    return this.scheduleService.authenticateGoogleUser(res, slot_id);
  }

  @Get('book/slot')
  bookSlot(@Query() query: any) {
    return this.scheduleService.bookSlot(query);
  }

  @Get('host/get-booked-slots')
  @UseGuards(JwtAuthGuard)
  getBookedSlots(@CurrentUser() user: User) {
    return this.scheduleService.getBookedSlots(user);
  }
}
