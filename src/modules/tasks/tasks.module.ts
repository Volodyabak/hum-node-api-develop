import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './services/tasks.service';
import { ScheduledTaskService } from './services/scheduled-task.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { BrackhitsModule } from '../brackhits/brackhits.module';
import { RepositoryModule } from '../repository/repository.module';
import { AppEventsModule } from '../app-events/app-events.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    NotificationsModule,
    AnalyticsModule,
    BrackhitsModule,
    RepositoryModule,
    AppEventsModule,
  ],
  providers: [TasksService, ScheduledTaskService],
  exports: [ScheduledTaskService],
})
export class TasksModule {}
