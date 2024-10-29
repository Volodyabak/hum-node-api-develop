import { Module } from '@nestjs/common';
import { ArtistController } from './controllers/artist.controller';
import { ArtistsService } from './services/artists.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { RepositoryModule } from '../repository/repository.module';
import { ArtistHomeController } from './controllers/artist-home.controller';
import { ArtistHomeService } from './services/artist-home.service';
import { FeedModule } from '../feed/feed.module';

@Module({
  imports: [AnalyticsModule, FeedModule, RepositoryModule],
  controllers: [ArtistHomeController, ArtistController],
  providers: [ArtistsService, ArtistHomeService],
  exports: [ArtistsService, ArtistHomeService],
})
export class ArtistsModule {}
