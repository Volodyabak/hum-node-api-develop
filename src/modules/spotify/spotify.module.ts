import { Module } from '@nestjs/common';

import { SpotifyController } from './controllers/spotify.controller';
import { SpotifyService } from './services/spotify.service';
import { SpotifySdk } from './services/spotify.sdk';
import { PlaylistService } from './services/playlist.service';
import { AwsModule } from '../aws/aws.module';
import { SpotifyClient } from './services/spotify.client';
import { RepositoryModule } from '../repository/repository.module';
import { SpotifyContentService } from './services/spotify-content.service';
import { AppEventsModule } from '../app-events/app-events.module';

@Module({
  imports: [AwsModule, RepositoryModule, AppEventsModule],
  controllers: [SpotifyController],
  providers: [SpotifyService, SpotifySdk, SpotifyClient, PlaylistService, SpotifyContentService],
  exports: [SpotifyService, SpotifyClient, PlaylistService, SpotifySdk, SpotifyContentService],
})
export class SpotifyModule {}
