import { forwardRef, Module } from '@nestjs/common';
import { FriendsControllers } from './controllers/friends.controllers';
import { FriendsService } from './services/friends.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { FriendsUtilsService } from './services/friends-utils.service';
import { UsersModule } from '../users/users.module';
import { BrackhitsModule } from '../brackhits/brackhits.module';
import { AppEventsModule } from '../app-events/app-events.module';
import { RepositoryModule } from '../repository/repository.module';

@Module({
  imports: [
    AppEventsModule,
    RepositoryModule,
    forwardRef(() => NotificationsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => BrackhitsModule),
  ],
  controllers: [FriendsControllers],
  providers: [FriendsService, FriendsUtilsService],
  exports: [FriendsService, FriendsUtilsService],
})
export class FriendsModule {}
