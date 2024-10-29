import { Module } from '@nestjs/common';
import { BrackhitsContentService } from './services/brackhits-content.service';
import { YoutubeModule } from '../youtube/youtube.module';
import { VimeoModule } from '../vimeo/vimeo.module';
import { SpotifyModule } from '../spotify/spotify.module';
import { CustomContentService } from './services/custom-content.service';
import { TiktokModule } from '../tiktok/tiktok.module';

@Module({
  imports: [VimeoModule, YoutubeModule, SpotifyModule, TiktokModule],
  providers: [BrackhitsContentService, CustomContentService],
  exports: [BrackhitsContentService, CustomContentService],
})
export class BrackhitsContentModule {}
