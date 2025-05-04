import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { MessagingService } from '../messaging/messaging.service';
import { OrderSchema } from './order.schema';
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
      { name: 'Order', schema: OrderSchema },
    ]),
    AppConfigModule,
    HttpModule
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    MessagingService,
  ]
})
export class OrderModule {}
