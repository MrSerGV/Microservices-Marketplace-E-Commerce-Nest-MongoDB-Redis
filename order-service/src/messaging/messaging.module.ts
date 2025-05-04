import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        RedisModule.forRootAsync({
            useFactory: (configService: ConfigService): RedisModuleOptions  => ({
                 type: 'single',
                 url: configService.get<string>('messageBroker.url'),
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [MessagingController],
    providers: [MessagingService],
})
export class MessagingModule {}
