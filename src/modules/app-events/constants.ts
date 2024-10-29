import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppEvent, AppEventName, AppEventPayload } from './app-events.types';

export const AppEventEmitter2 = new EventEmitter2();

export function emitExpressServerEvent(
  eventName: AppEventName,
  eventData?: AppEventPayload[AppEventName],
): void {
  const appEvent: AppEvent = { eventName, eventData };
  AppEventEmitter2.emit(eventName, appEvent);
}
