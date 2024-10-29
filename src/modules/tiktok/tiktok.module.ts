import { Module } from '@nestjs/common';
import { TiktokService } from './services/tiktok.service';

@Module({
  providers: [TiktokService],
  exports: [TiktokService],
})
export class TiktokModule {}
