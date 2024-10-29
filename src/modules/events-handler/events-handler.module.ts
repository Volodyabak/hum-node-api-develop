import { forwardRef, Module } from '@nestjs/common';
import { EventsHandlerService } from './services/events-handler.service';
import { FacebookModule } from '../facebook/facebook.module';
import { BrackhitsModule } from '../brackhits/brackhits.module';
import { TasksModule } from '../tasks/tasks.module';
import { RepositoryModule } from '../repository/repository.module';
import { OneSignalModule } from '../one-signal/one-signal.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SpotifyModule } from '../spotify/spotify.module';

@Module({
  imports: [
    forwardRef(() => BrackhitsModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => TasksModule),
    OneSignalModule,
    FacebookModule,
    RepositoryModule,
    SpotifyModule,
  ],
  providers: [EventsHandlerService],
  exports: [EventsHandlerService],
})
export class EventsHandlerModule {}
