import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { EXCHANGE_NAME, ROUTING_KEY } from '../interfaces/rabbitmq.interface';
import { AppEvent } from '../../app-events/app-events.types';
import { Options } from 'amqplib';

@Injectable()
export class RabbitmqPublisherService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async publish(exchange: EXCHANGE_NAME, routingKey: ROUTING_KEY, message: AppEvent) {
    const queueOptions = this.getMessageOptions(message);
    await this.amqpConnection.publish(exchange, routingKey, message, queueOptions);
  }

  private getMessageOptions(message: AppEvent): Options.Publish {
    const headers = message.headers;
    if (!headers) return undefined;

    const headersMap = new Map<string, any>();

    if (headers.delay) {
      headersMap.set('x_delay', headers.delay);
    }

    return {
      headers: headersMap,
    };
  }
}
