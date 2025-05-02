import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { InvoiceProducer } from '../messaging/invoice-producer';
import { OrderSchema } from './order.schema';
import { AppConfigModule } from '../config/config.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
    ]),
    AppConfigModule,
    HttpModule
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    InvoiceProducer,
  ]
})
export class OrderModule {}
