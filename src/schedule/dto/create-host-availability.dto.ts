import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateHostAvailabilityRequest {
  availability_id: string;

  host_email: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  day_start_time: string;

  @IsNotEmpty()
  @IsString()
  day_end_time: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(10)
  @Max(60)
  per_slot_duration: number;

  status: string;

  created_at: string;

  updated_at: string;

  metadata: any;
}
