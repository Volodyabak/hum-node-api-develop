import { Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { MessageBuilderService } from './services/message-builder.service';
import { NotificationController } from './controllers/notification.controller';
import { NotificationControllerService } from './services/notification-controller.service';
import { BrackhitsModule } from '../brackhits/brackhits.module';
import { OneSignalModule } from '../one-signal/one-signal.module';
import { RepositoryModule } from '../repository/repository.module';

@Module({
  imports: [BrackhitsModule, OneSignalModule, RepositoryModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationControllerService, MessageBuilderService],
  exports: [NotificationService],
})
export class NotificationsModule {}
