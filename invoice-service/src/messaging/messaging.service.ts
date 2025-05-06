import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

import { InvoiceService } from '../invoices/invoice.service';

export enum Channel {
    Created_order = 'create_order',
    Shipped_order = 'shipped_order',
    Critical_failures= 'critical_failures',
}

@Injectable()
export class MessagingService implements OnModuleInit {
    private readonly logger = new Logger(MessagingService.name);
    private readonly MAX_RETRIES = 3;
    private readonly redisSubscriber: Redis;
    private readonly redisPublisher: Redis;

    constructor(
        @InjectRedis() private readonly redisClient: Redis,
        private readonly invoiceProducer: InvoiceService,
    ) {
        this.redisSubscriber = this.redisClient;
        this.redisPublisher = this.redisClient.duplicate();
    }

    async onModuleInit() {

        this.redisSubscriber.subscribe(Channel.Created_order, (err, count) => {
            this.logger.log(`Subscribed to ${Channel.Created_order} channel`);
        });


        this.redisSubscriber.subscribe(Channel.Shipped_order, (err, count) => {
            this.logger.log(`Subscribed to ${Channel.Shipped_order} channel`);
        });

        this.redisSubscriber.on('message', (channel: Channel, orderId: string) => {
            if (channel === Channel.Created_order) {
                this.logger.log(`Creating invoice for Order ID=${orderId}`);
                this.retryProcessing(() => this.invoiceProducer.createInvoice(orderId), `at Channel=${Channel.Created_order} for Order ID=${orderId}`);
            }
            if (channel === Channel.Shipped_order) {
                this.logger.log(`Mark Order ID=${orderId} as shipped at invoice`);
                this.retryProcessing(() => this.invoiceProducer.markOrderShipped(orderId), `at Channel=${Channel.Shipped_order} for Order ID=${orderId}`);
            }
        });
    };

    private async retryProcessing(processFunction: () => Promise<any>, contextMessage: string, attempt = 1) {
        try {
            this.logger.log(`Retry processing Attempt=${attempt} ${contextMessage} `);
            await processFunction();
        } catch (error) {
            if (attempt < this.MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.retryProcessing(processFunction, contextMessage, attempt + 1);
            } else {
                this.redisPublisher.publish(Channel.Critical_failures, JSON.stringify(error));
            }
        }
    };
}

