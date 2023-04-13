import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/users/current-user.decorator';
import { User } from 'src/users/schemas/user.schema';
import { ScheduleService } from './schedule.service';
import { CreateHostAvailabilityRequest } from './dto/create-host-availability.dto';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Slot } from './schemas/slot.schema';
import { APIResponse } from 'src/app.controller';

@Controller('schedule')
@ApiTags('Schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // Create a new schedule
  @Post('create')
  @ApiOperation({
    summary: 'Create a new host availability',
    operationId: 'createSchedule',
  })
  @ApiBearerAuth('Authorization')
  @ApiBody({
    type: CreateHostAvailabilityRequest,
  })
  @ApiResponse({
    status: 201,
    description:
      'Host availability created successfully. Return the slots created between the available hours',
    type: [Slot],
  })
  @UseGuards(JwtAuthGuard)
  createSchedule(
    @CurrentUser() user: User,
    @Body() request: CreateHostAvailabilityRequest,
  ): Promise<Slot[]> {
    return this.scheduleService.createSchedule(request, user);
  }

  // Delete a slot
  @Delete('slot/:slot_id')
  @ApiOperation({
    summary: 'Delete a slot',
    operationId: 'deleteSlot',
  })
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'Slot deleted successfully',
    type: APIResponse,
  })
  @ApiParam({ name: 'slot_id', type: String, description: 'Slot ID' })
  @UseGuards(JwtAuthGuard)
  deleteSlot(@CurrentUser() user: User, @Param('slot_id') slot_id: any) {
    return this.scheduleService.deleteSlot(slot_id, user);
  }

  // Get the availability of a host
  @Get('availability/:host_email_id')
  @ApiOperation({
    summary: 'Get the availability of a host',
    operationId: 'getAvailability',
  })
  @ApiParam({
    name: 'host_email_id',
    type: String,
    description: 'Host email ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Host availabilities',
    type: [Slot],
  })
  getAvailability(@Param('host_email_id') host_email_id: any) {
    return this.scheduleService.getAvailabilities(host_email_id);
  }

  // Authenticate the user with google in order to book a slot
  @Get('book/:slot_id/authenticate')
  @ApiOperation({
    summary: 'Authenticate the user with google in order to book a slot',
    operationId: 'bookSlotAuthentication',
  })
  @ApiParam({ name: 'slot_id', type: String, description: 'Slot ID' })
  @ApiResponse({
    status: 200,
    description: 'Redirect to google authentication',
  })
  bookSlotAuthentication(
    @Res() res: Response,
    @Param('slot_id') slot_id: string,
  ) {
    return this.scheduleService.authenticateGoogleUser(res, slot_id);
  }

  // Book a slot
  @Get('book/slot')
  @ApiOperation({
    summary: 'Book a slot',
    operationId: 'bookSlot',
  })
  @ApiQuery({
    name: 'slot_id',
    type: String,
    description: 'Slot ID',
    required: true,
  })
  @ApiQuery({
    name: 'code',
    type: String,
    description: 'Google authentication code',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Slot booked successfully',
    type: Slot,
  })
  bookSlot(@Query() query: any) {
    return this.scheduleService.bookSlot(query);
  }

  // Get the booked slots of the current user
  @Get('host/get-booked-slots')
  @ApiOperation({
    summary: 'Get the booked slots of the current host user',
    operationId: 'getBookedSlots',
  })
  @ApiBearerAuth('Authorization')
  @ApiResponse({
    status: 200,
    description: 'Booked slots of the current host user',
    type: [Slot],
  })
  @UseGuards(JwtAuthGuard)
  getBookedSlots(@CurrentUser() user: User) {
    return this.scheduleService.getBookedSlots(user);
  }
}
