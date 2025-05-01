import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { DEFAULTS } from '../config/defaults';

@Injectable()
export class InvoiceProducer {
    private readonly logger = new Logger(InvoiceProducer.name);
    private readonly invoiceServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.invoiceServiceUrl = this.configService.get<string>('messageBroker.url') || DEFAULTS.MESSAGE_BROKER_URL;
    }

    async sendOrderCreated(orderId: string): Promise<void> {
        const url = `${this.invoiceServiceUrl}/create`;
        try {
            this.logger.log(`Sending order creation notification for Order ID: ${orderId} to ${url}`);
            await this.httpService.axiosRef.post(url, { orderId });
        } catch (error) {
            this.logger.error(`Failed to notify invoice service for Order ID: ${orderId}`, error.stack);
            throw error;
        }
    }

    async sendOrderShipped(orderId: string): Promise<void> {
        const url = `${this.invoiceServiceUrl}/shipped`;
        try {
            this.logger.log(`Sending order shipment notification for Order ID: ${orderId} to ${url}`);
            await this.httpService.axiosRef.post(url, { orderId });
        } catch (error) {
            this.logger.error(`Failed to notify invoice service for Order ID: ${orderId}`, error.stack);
            throw error;
        }
    }
}
