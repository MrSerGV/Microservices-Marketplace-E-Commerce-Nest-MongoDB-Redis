import { registerAs } from '@nestjs/config';

import { DEFAULTS } from './defaults';

export default registerAs('database', () => ({
    uri: process.env.MONGO_URI || DEFAULTS.MONGO_URI,
}));
