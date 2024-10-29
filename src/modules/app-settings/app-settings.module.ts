import { Module } from '@nestjs/common';
import { AppSettingsService } from './service/app-settings.service';
import { AppSettingsControllers } from './controller/app-settings.controllers';

@Module({
  controllers: [AppSettingsControllers],
  providers: [AppSettingsService],
  exports: [AppSettingsService],
})
export class AppSettingsModule {}
