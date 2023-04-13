import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateHostAvailabilityRequest {
  availability_id: string;

  host_email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  date: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  day_start_time: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  day_end_time: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(10)
  @Max(60)
  @ApiProperty()
  per_slot_duration: number;

  status: string;

  created_at: string;

  updated_at: string;

  metadata: any;
}
