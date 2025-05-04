import { registerAs } from '@nestjs/config';

export default registerAs('messageBroker', () => ({
    url: process.env.MESSAGE_BROKER_URL,
}));
