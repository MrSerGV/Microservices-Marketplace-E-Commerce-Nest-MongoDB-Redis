import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class MessagingService {
    private readonly logger = new Logger(MessagingService.name);

    constructor(@InjectRedis() private readonly redis: Redis) {}

    async sendOrderCreated(orderId: string) {
        try {
            this.logger.log(`Sending order shipment notification for Order ID=${orderId}`);
            await this.redis.publish('create_order', orderId);
        } catch (error) {
            this.logger.error(`Failed to notify invoice service for Order ID=${orderId}`, error.stack);
            throw error;
        }
    }

    async sendOrderShipped(orderId: string) {
        try {
            this.logger.log(`Sending order shipment notification for Order ID=${orderId}`);
            await this.redis.publish('shipped_order', orderId);
        } catch (error) {
            this.logger.error(`Failed to notify invoice service for Order ID=${orderId}`, error.stack);
            throw error;
        }
    }
}
