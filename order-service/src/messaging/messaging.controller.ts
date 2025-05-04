import { Controller, Post, Body } from '@nestjs/common';
import { MessagingService } from './messaging.service';

@Controller('messaging')
export class MessagingController {
    constructor(private readonly messagingService: MessagingService) {}

    @Post('create')
    async createOrder(@Body() orderId: string) {
        return this.messagingService.sendOrderCreated(orderId);
    }

    @Post('ship')
    async shipOrder(@Body() orderId: string) {
        return this.messagingService.sendOrderShipped(orderId);
    }
}
