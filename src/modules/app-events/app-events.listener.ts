// import { Injectable, Logger } from '@nestjs/common';
// import { OnEvent } from '@nestjs/event-emitter';
//
// import { AppEvent } from './app-events.types';
// import { RabbitmqPublisherService } from '../rabbitmq/services/rabbitmq-publisher.service';
// import { EXCHANGE_NAME, ROUTING_KEY } from '../rabbitmq/interfaces/rabbitmq.interface';
// import { AppEventEmitter2 } from './constants';
//
// @Injectable()
// export class AppEventsListener {
//   private readonly logger = new Logger(AppEventsListener.name);
//
//   constructor(private readonly rabbitmqPublisherService: RabbitmqPublisherService) {
//     this.handleExpressServerEvents().catch();
//   }
//
//   @OnEvent('**')
//   async handleEventPropagationToRemote(event: AppEvent) {
//     this.logger.log(`EVENT ${event?.eventName} EMITTED`);
//
//     await this.rabbitmqPublisherService.publish(
//       EXCHANGE_NAME.API_EXCHANGE,
//       ROUTING_KEY.APP_EVENTS,
//       event,
//     );
//   }
//
//   async handleExpressServerEvents() {
//     AppEventEmitter2.onAny((event, data) => {
//       this.handleEventPropagationToRemote(data);
//     });
//   }
// }
