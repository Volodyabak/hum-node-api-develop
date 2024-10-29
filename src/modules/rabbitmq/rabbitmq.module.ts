import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { rabbitmqConfig } from './configs/rabbitmq.config';
import { RabbitmqPublisherService } from './services/rabbitmq-publisher.service';
import { RabbitmqConsumerService } from './services/rabbitmq-consumer.service';
import { EventsHandlerModule } from '../events-handler/events-handler.module';

@Module({
  imports: [RabbitMQModule.forRoot(RabbitMQModule, rabbitmqConfig), EventsHandlerModule],
  providers: [RabbitmqPublisherService, RabbitmqConsumerService],
  exports: [RabbitmqPublisherService],
})
export class RabbitmqModule {}
