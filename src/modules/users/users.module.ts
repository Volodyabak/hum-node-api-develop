import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { BrackhitsModule } from '../brackhits/brackhits.module';
import { FriendsModule } from '../friends/friends.module';
import { RepositoryModule } from '../repository/repository.module';
import { SpotifyModule } from '../spotify/spotify.module';
import { AwsModule } from '../aws/aws.module';
import { OneSignalModule } from '../one-signal/one-signal.module';
import { FeedModule } from '../feed/feed.module';
import { BallotsModule } from '../ballots/ballots.module';

@Module({
  imports: [
    AwsModule,
    RepositoryModule,
    SpotifyModule,
    forwardRef(() => BrackhitsModule),
    forwardRef(() => FriendsModule),
    OneSignalModule,
    FeedModule,
    BallotsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
