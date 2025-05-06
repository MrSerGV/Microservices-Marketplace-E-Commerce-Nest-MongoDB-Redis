import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import { InvoiceModule } from '../invoices/invoice.module';

@Module({
    imports: [
        InvoiceModule,
        RedisModule.forRootAsync({
            useFactory: (configService: ConfigService): RedisModuleOptions  => ({
                 type: 'single',
                 url: configService.get<string>('messageBroker.url'),
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [MessagingService],
})
export class MessagingModule {}
