import { Module } from '@nestjs/common';
import { RepositoryModule } from '../repository/repository.module';
import { BrackhitsContentModule } from '../brackhits-content/brackhits-content.module';
import { GamesService } from './services/games.service';
import { CalculationsService } from './services/calculations.service';

@Module({
  imports: [RepositoryModule, BrackhitsContentModule],
  providers: [GamesService, CalculationsService],
  exports: [GamesService, CalculationsService],
})
export class GamesModule {}
