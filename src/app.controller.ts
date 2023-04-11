import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

export interface APIResponse {
  message: string;
  code: number;
  errors: Array<string>;
  data?: any;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getServerStatus() {
    return this.appService.getServerStats();
  }
}
