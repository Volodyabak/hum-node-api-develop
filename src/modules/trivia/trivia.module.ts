import { forwardRef, Module } from '@nestjs/common';
import { TriviaController } from './controllers/trivia.controller';
import { TriviaService } from './services/trivia.service';
import { RepositoryModule } from '../repository/repository.module';
import { BrackhitsContentModule } from '../brackhits-content/brackhits-content.module';
import { CampaignModule } from '../campaigns/campaign.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Trivia, TriviaSchema } from '@database/mongodb/games/trivia';
import { GamesModule } from '../games/games.module';
import { TriviaControllerV2 } from './controllers/trivia.controller.v2';
import { TriviaServiceV2 } from './services/trivia.service.v2';
import { TriviaResultsService } from './services/trivia-results.service';

@Module({
  imports: [
    RepositoryModule,
    BrackhitsContentModule,
    GamesModule,
    forwardRef(() => CampaignModule),
    MongooseModule.forFeature([{ name: Trivia.name, schema: TriviaSchema }]),
  ],
  controllers: [TriviaController, TriviaControllerV2],
  providers: [TriviaService, TriviaServiceV2, TriviaResultsService],
  exports: [TriviaServiceV2, TriviaResultsService],
})
export class TriviaModule {}
