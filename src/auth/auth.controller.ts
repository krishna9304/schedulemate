import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from 'src/users/current-user.decorator';
import { User } from 'src/users/schemas/user.schema';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
    response.send(user);
  }

  @Get('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    await this.authService.logout(response);
    response.send(null);
  }

  @Get('self')
  @UseGuards(JwtAuthGuard)
  async getSelf(@CurrentUser() user: User) {
    return user;
  }
}
