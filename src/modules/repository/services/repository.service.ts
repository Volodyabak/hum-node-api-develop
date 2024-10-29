import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';
import { BrackhitRepository } from '../repositories/brackhit/brackhit.repository';
import { BrackhitChallengeRepository } from '../repositories/brackhit/brackhit-challenge.repository';
import { BrackhitHomeRepository } from '../repositories/brackhit/brackhit-home.repository';
import { BrackhitCommentRepository } from '../repositories/brackhit/brackhit-comment.repository';
import { BrackhitHubRepository } from '../repositories/brackhit/brackhit-hub.repository';
import { AnalyticsRepository } from '../repositories/analytics/analytics.repository';
import { ArtistRepository } from '../repositories/artist/artist.repository';
import { FeedRepository } from '../repositories/artist/feed.repository';
import { FriendRepository } from '../repositories/friend/friend.repository';
import { ScheduledTaskRepository } from '../repositories/task/scheduled-task.repository';
import { TrackRepository } from '../repositories/track/track.repository';
import { ArtistHomeRepository } from '../repositories/artist/artist-home.repository';
import { CompanyRepository } from '../repositories/company/company.repository';
import { CampaignRepository } from '../repositories/campaign/campaign.repository';
import { ConstantsRepository } from '../../constants/repository/constants.repository';
import { AppleMusicRepository } from '../repositories/apple-music/apple-music.repository';
import { ContentRepository } from '../repositories/content/content.repository';
import { BallotsRepository } from '../repositories/ballots/ballots.repository';
import { TriviaRepository } from '../repositories/trivia/trivia.repository';

@Injectable()
export class RepositoryService {
  constructor(
    public readonly userRepo: UserRepository,
    public readonly brackhitRepo: BrackhitRepository,
    public readonly brackhitChallengeRepo: BrackhitChallengeRepository,
    public readonly brackhitHomeRepo: BrackhitHomeRepository,
    public readonly brackhitCommentRepo: BrackhitCommentRepository,
    public readonly brackhitHubRepo: BrackhitHubRepository,
    public readonly analyticsRepo: AnalyticsRepository,
    public readonly artistRepo: ArtistRepository,
    public readonly artistHomeRepo: ArtistHomeRepository,
    public readonly feedRepo: FeedRepository,
    public readonly friendRepo: FriendRepository,
    public readonly scheduledTaskRepo: ScheduledTaskRepository,
    public readonly trackRepo: TrackRepository,
    public readonly companyRepo: CompanyRepository,
    public readonly campaign: CampaignRepository,
    public readonly constantsRepo: ConstantsRepository,
    public readonly appleMusic: AppleMusicRepository,
    public readonly contentRepo: ContentRepository,
    public readonly ballots: BallotsRepository,
    public readonly trivia: TriviaRepository,
  ) {}
}
