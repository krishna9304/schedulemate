import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserRequest {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  gender: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsMobilePhone('en-IN')
  @ApiProperty()
  primaryPhone: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  dateOfBirth: string;

  status: string;

  created_at: string;

  updated_at: string;

  metadata: any;
}
