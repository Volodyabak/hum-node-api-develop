import { Module } from '@nestjs/common';
import { VimeoService } from './services/vimeo.service';

@Module({
  providers: [VimeoService],
  exports: [VimeoService],
})
export class VimeoModule {}
