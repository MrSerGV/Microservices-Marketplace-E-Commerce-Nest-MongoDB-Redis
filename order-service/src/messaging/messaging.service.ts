import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

enum Channel {
    Created_order = 'create_order',
    Shipped_order = 'shipped_order',
    Critical_failures= 'critical_failures',
}

@Injectable()
export class MessagingService implements OnModuleInit {
    private readonly logger = new Logger(MessagingService.name);
    private readonly redisSubscriber: Redis;
    private readonly redisPublisher: Redis;

    constructor(@InjectRedis() private readonly redisClient: Redis) {
        this.redisSubscriber = this.redisClient;
        this.redisPublisher = this.redisClient.duplicate();
    }

    async onModuleInit() {

        this.redisSubscriber.subscribe(Channel.Critical_failures, (err, count) => {
            this.logger.log(`Subscribed to ${Channel.Critical_failures} channel`);
        });

        this.redisSubscriber.on('message', (channel: Channel, message: string) => {
            if (channel === Channel.Critical_failures) {
                this.logger.log(`Critical_failures message=${JSON.parse(message)}`);
            }
        });
    };

    async sendOrderCreated(orderId: string) {
        try {
            this.logger.log(`Sending order shipment notification for Order ID=${orderId}`);
            await this.redisPublisher.publish(Channel.Created_order, orderId);
        } catch (error) {
            this.logger.error(`Failed to notify invoice service for Order ID=${orderId}`, error.stack);
            throw error;
        }
    };

    async sendOrderShipped(orderId: string) {
        try {
            this.logger.log(`Sending order shipment notification for Order ID=${orderId}`);
            await this.redisPublisher.publish(Channel.Shipped_order, orderId);
        } catch (error) {
            this.logger.error(`Failed to notify invoice service for Order ID=${orderId}`, error.stack);
            throw error;
        }
    };
}
