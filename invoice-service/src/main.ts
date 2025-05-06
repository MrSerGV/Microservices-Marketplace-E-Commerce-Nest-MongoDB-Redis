import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port') || 4000;

  await app.listen(port);

  Logger.log(`Invoice microservice is running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
