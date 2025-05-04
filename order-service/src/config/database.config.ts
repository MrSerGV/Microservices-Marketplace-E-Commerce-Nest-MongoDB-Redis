import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    uri: process.env.DATABASE_URI,
    rs: process.env.DATABASE_RS,
    dbName: process.env.DATABASE_NAME,
}));
