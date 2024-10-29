import { Module } from '@nestjs/common';
import { YoutubeService } from './services/youtube.service';
import { RepositoryModule } from '../repository/repository.module';
import { YoutubeApi } from './services/youtube.api';

@Module({
  imports: [RepositoryModule],
  providers: [YoutubeService, YoutubeApi],
  exports: [YoutubeService],
})
export class YoutubeModule {}
