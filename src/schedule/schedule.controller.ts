import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/users/current-user.decorator';
import { User } from 'src/users/schemas/user.schema';
import { ScheduleService } from './schedule.service';
import { CreateHostAvailabilityRequest } from './dto/create-host-availability.dto';

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
}
