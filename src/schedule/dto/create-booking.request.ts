import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateHostAvailabilityRequest {
  slot_id: string;

  status: string;

  created_at: string;

  updated_at: string;

  metadata: any;
}
