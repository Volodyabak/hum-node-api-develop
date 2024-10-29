import { Module } from '@nestjs/common';
import { FeedService } from './services/feed.service';
import { RepositoryModule } from '../repository/repository.module';
import { FeedController } from './controllers/feed.controller';

@Module({
  imports: [RepositoryModule],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
