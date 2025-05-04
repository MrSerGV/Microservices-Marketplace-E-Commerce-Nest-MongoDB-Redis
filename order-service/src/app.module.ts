import { Module } from '@nestjs/common';

import { OrderModule } from './orders/order.module';
import { AppConfigModule } from './config/appConfig.module';
import { MessagingModule } from './messaging/messaging.module';


@Module({
  imports: [
    AppConfigModule,
    OrderModule,
    MessagingModule,
  ],
})
export class AppModule {}
