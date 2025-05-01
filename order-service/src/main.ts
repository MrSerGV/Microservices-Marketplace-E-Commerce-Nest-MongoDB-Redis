import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DEFAULTS } from './config/defaults';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port') || DEFAULTS.PORT;

  await app.listen(port);

  Logger.log(`Orders microservice is running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();