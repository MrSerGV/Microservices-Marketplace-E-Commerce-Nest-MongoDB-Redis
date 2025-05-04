import { registerAs } from '@nestjs/config';

export default registerAs('messageBroker', () => ({
    uri: process.env.MESSAGE_BROKER_URL,
}));
