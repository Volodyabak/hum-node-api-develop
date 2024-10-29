import { Module } from '@nestjs/common';
import { AppEventsListener } from './services/app-events-listener.service';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  providers: [AppEventsListener],
})
export class AppEventsListenerModule {}
