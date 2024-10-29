import { Module } from '@nestjs/common';
import { RepositoryService } from './services/repository.service';
import { UserRepository } from './repositories/user/user.repository';
import { BrackhitRepository } from './repositories/brackhit/brackhit.repository';
import { BrackhitChallengeRepository } from './repositories/brackhit/brackhit-challenge.repository';
import { BrackhitHomeRepository } from './repositories/brackhit/brackhit-home.repository';
import { BrackhitCommentRepository } from './repositories/brackhit/brackhit-comment.repository';
import { BrackhitHubRepository } from './repositories/brackhit/brackhit-hub.repository';
import { AnalyticsRepository } from './repositories/analytics/analytics.repository';
import { ArtistRepository } from './repositories/artist/artist.repository';
import { FeedRepository } from './repositories/artist/feed.repository';
import { FriendRepository } from './repositories/friend/friend.repository';
import { ScheduledTaskRepository } from './repositories/task/scheduled-task.repository';
import { TrackRepository } from './repositories/track/track.repository';
import { ArtistHomeRepository } from './repositories/artist/artist-home.repository';
import { CompanyRepository } from './repositories/company/company.repository';
import { CampaignRepository } from './repositories/campaign/campaign.repository';
import { ConstantsRepository } from '../constants/repository/constants.repository';
import { AppleMusicRepository } from './repositories/apple-music/apple-music.repository';
import { EventsRepository } from '../events/repositories/events.repository';
import { ContentRepository } from './repositories/content/content.repository';
import { BallotsRepository } from './repositories/ballots/ballots.repository';
import { TriviaRepository } from './repositories/trivia/trivia.repository';

@Module({
  providers: [
    RepositoryService,
    UserRepository,
    BrackhitRepository,
    BrackhitChallengeRepository,
    BrackhitHomeRepository,
    BrackhitCommentRepository,
    BrackhitHubRepository,
    AnalyticsRepository,
    ArtistRepository,
    ArtistHomeRepository,
    FeedRepository,
    FriendRepository,
    ScheduledTaskRepository,
    TrackRepository,
    CompanyRepository,
    CampaignRepository,
    ConstantsRepository,
    FeedRepository,
    AppleMusicRepository,
    EventsRepository,
    ContentRepository,
    BallotsRepository,
    TriviaRepository,
  ],
  exports: [RepositoryService],
})
export class RepositoryModule {}
