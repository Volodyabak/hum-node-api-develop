import { forwardRef, Module } from '@nestjs/common';
import { OneSignalController } from './controllers/one-signal.controller';
import { OneSignalService } from './services/one-signal.service';
import { OneSignalClient } from './services/one-signal.client';
import { BrackhitsModule } from '../brackhits/brackhits.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RepositoryModule } from '../repository/repository.module';

@Module({
  imports: [
    forwardRef(() => BrackhitsModule),
    forwardRef(() => NotificationsModule),
    RepositoryModule,
  ],
  controllers: [OneSignalController],
  providers: [OneSignalService, OneSignalClient],
  exports: [OneSignalService, OneSignalClient],
})
export class OneSignalModule {}
