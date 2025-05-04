import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
    port: process.env.ORDER_PORT,
    environment: process.env.NODE_ENV,
}));
