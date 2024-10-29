import { forwardRef, Module } from '@nestjs/common';
import { AwsModule } from '../aws/aws.module';
import { CampaignService } from './services/campaign.service';
import { CampaignController } from './controllers/campaign.controller';
import { RepositoryModule } from '../repository/repository.module';
import { BrackhitsModule } from '../brackhits/brackhits.module';
import { IpApiService } from './services/ip-api.service';
import { QrCodesModule } from '../qr-codes/qr-codes.module';
import { CampaignGameService } from './services/campaign-game.service';
import { CampaignSubmitService } from './services/campaign-submit.service';
import { CampaignGameUserService } from './services/campaign-game-user.service';
import { CampaignUserService } from './services/campaign-user.service';
import { TriviaModule } from '../trivia/trivia.module';
import { CampaignControllerV2 } from './controllers/campaign.controller.v2';
import { CampaignServiceV2 } from './services/campaign.service.v2';
import { CampaignAnalyticsController } from './controllers/campaign-analytics.controller';
import { CampaignAnalyticsService } from './services/campaign-analytics.service';
import { BallotsModule } from '../ballots/ballots.module';
import { SyncBridgeModule } from '../sync-bridge/sync-bridge.module';

@Module({
  imports: [
    AwsModule,
    RepositoryModule,
    QrCodesModule,
    SyncBridgeModule,
    forwardRef(() => BrackhitsModule),
    forwardRef(() => BallotsModule),
    forwardRef(() => TriviaModule),
  ],
  controllers: [CampaignController, CampaignControllerV2, CampaignAnalyticsController],
  providers: [
    CampaignService,
    CampaignServiceV2,
    CampaignGameService,
    CampaignGameUserService,
    CampaignSubmitService,
    CampaignUserService,
    IpApiService,
    CampaignAnalyticsService,
  ],
  exports: [
    CampaignService,
    CampaignGameService,
    CampaignSubmitService,
    CampaignGameUserService,
    CampaignUserService,
  ],
})
export class CampaignModule {}
