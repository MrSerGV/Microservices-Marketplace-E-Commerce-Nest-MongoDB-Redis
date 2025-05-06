import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';

import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from './invoice.repository';
import { MessagingService } from '../messaging/messaging.service';
import { InvoiceSchema } from './invoice.schema';
import { AppConfigModule } from '../config/appConfig.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService): MongooseModuleOptions => ({
        uri: configService.get<string>('database.url'),
        replicaSet: configService.get<string>('database.rs'),
        dbName: configService.get<string>('database.dbName'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'Invoice', schema: InvoiceSchema },
    ]),
    AppConfigModule,
    HttpModule
  ],
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
    InvoiceRepository,
    MessagingService,
  ],
  exports: [InvoiceService],
})
export class InvoiceModule {}
