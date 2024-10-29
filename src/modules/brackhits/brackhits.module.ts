import { forwardRef, Module } from '@nestjs/common';

import { TransactionsModule } from '../transactions/transactions.module';
import { BrackhitsController } from './controllers/brackhits.controller';
import { BrackhitsCommentsController } from './controllers/brackhits-comments.controller';
import { BrackhitsService } from './services/brackhits.service';
import { BrackhitsCommentsService } from './services/brackhits-comments.service';
import { BrackhitsCalculationService } from './services/brackhits-calculation.service';
import { AppEventsModule } from '../app-events/app-events.module';
import { BrackhitsHubControllers } from './controllers/brackhits-hub.controllers';
import { BrackhitsHubService } from './services/brackhits-hub.service';
import { AwsModule } from '../aws/aws.module';
import { UsersModule } from '../users/users.module';
import { SpotifyModule } from '../spotify/spotify.module';
import { BrackhitsHomeControllers } from './controllers/brackhits-home.controllers';
import { BrackhitsHomeService } from './services/brackhits-home.service';
import { TracksModule } from '../tracks/tracks.module';
import { BrackhitsChallengesService } from './services/brackhits-challenges.service';
import { BrackhitsChallengesController } from './controllers/brackhits-challenges.controller';
import { RepositoryModule } from '../repository/repository.module';
import { BrackhitsV2Controller } from './controllers/brackhits-v2.controller';
import { YoutubeModule } from '../youtube/youtube.module';
import { BrackhitsContentService } from '../brackhits-content/services/brackhits-content.service';
import { BrackhitsContentModule } from '../brackhits-content/brackhits-content.module';
import { VimeoModule } from '../vimeo/vimeo.module';
import { TiktokModule } from '../tiktok/tiktok.module';

@Module({
  imports: [
    TransactionsModule,
    forwardRef(() => UsersModule),
    AppEventsModule,
    SpotifyModule,
    AwsModule,
    TracksModule,
    RepositoryModule,
    YoutubeModule,
    BrackhitsContentModule,
    VimeoModule,
    TiktokModule,
  ],
  controllers: [
    BrackhitsCommentsController,
    BrackhitsHubControllers,
    BrackhitsHomeControllers,
    BrackhitsChallengesController,
    BrackhitsController, // should be the last one to prevent endpoint names collisions
    BrackhitsV2Controller,
  ],
  providers: [
    BrackhitsService,
    BrackhitsCommentsService,
    BrackhitsCalculationService,
    BrackhitsHubService,
    BrackhitsHomeService,
    BrackhitsChallengesService,
    BrackhitsContentService,
  ],
  exports: [
    BrackhitsService,
    BrackhitsCommentsService,
    BrackhitsCalculationService,
    BrackhitsHubService,
    BrackhitsHomeService,
    BrackhitsChallengesService,
    BrackhitsContentService,
  ],
})
export class BrackhitsModule {}
