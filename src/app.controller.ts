import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';

export class APIResponse {
  @ApiProperty()
  message: string;

  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: [] })
  errors: Array<string>;

  @ApiProperty({ example: null })
  data?: any;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Get server status',
    operationId: 'getServerStatus',
  })
  @ApiResponse({
    status: 200,
    description: 'Server status',
    type: APIResponse,
  })
  getServerStatus() {
    return this.appService.getServerStats();
  }
}
