import { registerAs } from '@nestjs/config';

import { DEFAULTS } from './defaults';

export default registerAs('app', () => ({
    port: process.env.PORT || DEFAULTS.PORT,
    environment: process.env.NODE_ENV || DEFAULTS.NODE_ENV,
}));
