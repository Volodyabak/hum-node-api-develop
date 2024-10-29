import { Module } from '@nestjs/common';
import { BallotsController } from './controllers/ballots.controller';
import { BallotsService } from './services/ballots.service';
import { RepositoryModule } from '../repository/repository.module';
import { BrackhitsContentModule } from '../brackhits-content/brackhits-content.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Ballot, BallotSchema } from '@database/mongodb/games/ballot';
import { GamesModule } from '../games/games.module';
import { CampaignModule } from '../campaigns/campaign.module';
import { BallotsServiceV2 } from './services/ballots.service.v2';
import { BallotsControllerV2 } from './controllers/ballots.controller.v2';

@Module({
  imports: [
    RepositoryModule,
    BrackhitsContentModule,
    GamesModule,
    CampaignModule,
    MongooseModule.forFeature([{ name: Ballot.name, schema: BallotSchema }]),
  ],
  controllers: [BallotsController, BallotsControllerV2],
  providers: [BallotsService, BallotsServiceV2],
  exports: [BallotsService],
})
export class BallotsModule {}
