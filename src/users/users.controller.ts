import { Body, Controller, Post, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequest } from './dto/create-user.dto';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async createUser(
    @Body() request: CreateUserRequest,
    @Res() response: Response,
  ) {
    const user = await this.usersService.createUser(request);
    await this.authService.login(user, response);
    response.send(user);
  }
}
