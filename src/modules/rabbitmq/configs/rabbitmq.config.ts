import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { EXCHANGE_NAME, EXCHANGE_TYPE } from '../interfaces/rabbitmq.interface';

export const rabbitmqConfig: RabbitMQConfig = {
  exchanges: [
    {
      name: EXCHANGE_NAME.API_EXCHANGE,
      type: EXCHANGE_TYPE.DIRECT,
    },
  ],
  uri: process.env.RABBITMQ_URI,
  connectionInitOptions: { wait: true },
};
