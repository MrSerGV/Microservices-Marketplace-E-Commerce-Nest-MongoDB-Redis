import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    url: process.env.DATABASE_URL,
    rs: process.env.DATABASE_RS,
    dbName: process.env.DATABASE_ORDER_NAME,
}));
