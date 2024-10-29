import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppEvent, AppEventHeaders, AppEventName, AppEventPayload } from './app-events.types';

@Injectable()
export class AppEventsEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit(
    eventName: AppEventName,
    eventData?: AppEventPayload[AppEventName],
    headers?: AppEventHeaders,
  ): void {
    const appEvent: AppEvent = { eventName, eventData, headers };
    this.eventEmitter.emit(eventName, appEvent);
  }
}
