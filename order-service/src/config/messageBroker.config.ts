import { registerAs } from '@nestjs/config';

import { DEFAULTS } from './defaults';

export default registerAs('messageBroker', () => ({
    uri: process.env.MESSAGE_BROKER_URL || DEFAULTS.MESSAGE_BROKER_URL,
}));
