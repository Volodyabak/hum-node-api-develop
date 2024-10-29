import { Environment, whiteListedOrigins } from './constants';

require('dotenv').config();

import { setupSwagger } from './swagger';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';

import app from './app';
import { AppModule } from './app.module';
import { pool } from '@database/MYSQL_database';
import { AllExceptionsFilter } from './Tools/all-exception.filter';
import helmet from 'helmet';

global.connection = pool;

const { NODE_ENV: env = 'local', PORT: port = 8080 } = process.env;

async function bootstrap() {
  const logger = new Logger('bootstrap');

  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(app));
  nestApp.enableCors({ origin: env === Environment.PROD ? whiteListedOrigins : '*' });
  setupSwagger(nestApp);

  nestApp.use(helmet.xssFilter());

  const { httpAdapter } = nestApp.get(HttpAdapterHost);
  nestApp.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  await nestApp.init();

  await nestApp.listen(port);
  logger.log(`App ${env} is now listening on port: ${port};`);
}

bootstrap();
