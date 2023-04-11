import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateUserRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsMobilePhone('en-IN')
  primaryPhone: string;

  @IsNotEmpty()
  dateOfBirth: string;

  status: string;

  created_at: string;

  updated_at: string;

  metadata: any;
}
