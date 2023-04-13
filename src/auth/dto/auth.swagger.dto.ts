import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { User } from 'src/users/schemas/user.schema';

export class LoginRequestDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  user: User;

  @IsString()
  @ApiProperty()
  token: string;
}
