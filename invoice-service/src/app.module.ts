import { Module } from '@nestjs/common';

import { AppConfigModule } from './config/appConfig.module';
import { MessagingModule } from './messaging/messaging.module';
import { InvoiceModule } from './invoices/invoice.module';


@Module({
  imports: [
    AppConfigModule,
    MessagingModule,
    InvoiceModule,
  ],
})
export class AppModule {}
