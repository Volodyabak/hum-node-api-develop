import { Module } from '@nestjs/common';
import { TracksService } from './services/tracks.service';
import { TracksParser } from './utils/tracks.parser';
import { AwsModule } from '../aws/aws.module';
import { RepositoryModule } from '../repository/repository.module';

@Module({
  imports: [AwsModule, RepositoryModule],
  controllers: [],
  providers: [TracksService, TracksParser],
  exports: [TracksService],
})
export class TracksModule {}
