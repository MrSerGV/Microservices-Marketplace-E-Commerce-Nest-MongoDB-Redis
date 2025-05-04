import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { OrderModule } from './orders/order.module';
import { AppConfigModule } from './config/config.module';


@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService): MongooseModuleOptions => ({
        uri: configService.get<string>('database.uri'),
        replicaSet: configService.get<string>('database.rs'),
        dbName: configService.get<string>('database.dbName'),
      }),
      inject: [ConfigService],
    }),
    OrderModule,
  ],
})
export class AppModule {}
