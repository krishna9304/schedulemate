import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [AuthModule, DatabaseModule, UsersModule, ScheduleModule],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
