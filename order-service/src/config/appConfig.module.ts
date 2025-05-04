import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import databaseConfig from './database.config';
import appConfig from './app.config';
import messageBrokerConfig from './messageBroker.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig, appConfig, messageBrokerConfig],
        }),
    ],
})
export class AppConfigModule {}