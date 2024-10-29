import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppEventsEmitter } from './app-events.emitter';

@Module({
  imports: [EventEmitterModule.forRoot({ wildcard: true })],
  providers: [AppEventsEmitter],
  exports: [AppEventsEmitter],
})
export class AppEventsModule {}
