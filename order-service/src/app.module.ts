import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderModule } from './orders/order.module';
import { AppConfigModule } from './config/config.module';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      useFactory: (configService) => ({
        uri: configService.get('database.uri'),
      }),
      inject: [ConfigService],
    }),
    OrderModule,
  ],
})
export class AppModule {}
