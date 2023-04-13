import { Injectable } from '@nestjs/common';
import { APIResponse } from './app.controller';

@Injectable()
export class AppService {
  getServerStats(): APIResponse {
    return {
      message: 'Schedulemate HTTP server running',
      code: 200,
      errors: [],
    };
  }
}
