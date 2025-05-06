import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';

import { OrderRepository } from './order.repository';
import { CreateOrderDto, OrderPathParamDto, UpdateOrderDto, SellerPathParamDto } from './order.dto';
import { MessagingService } from '../messaging/messaging.service';
import { Order, OrderStatus } from './order.schema';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
      private readonly orderRepository: OrderRepository,
      private readonly invoiceProducer: MessagingService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const session = await this.orderRepository.startTransaction();
    try {
      this.logger.log('Creating a new order');
      const orderInstance = await this.orderRepository.createAndSaveOrder(createOrderDto, session);

      await this.notifyInvoiceService(orderInstance.id, OrderStatus.Created);

      await session.commitTransaction();

      return orderInstance;
    } catch (error) {
      this.logger.error('Transaction failed, rolling back...', error.stack);
      await session.abortTransaction();
      this.handleError('Failed to create order', error);
    } finally {
      await session.endSession();
    }
  };

  async listOrdersBySellerId(sellerId: string): Promise<Order[]> {
    this.logger.log(`Fetching orders for Seller ID=${sellerId}`);

    const list = await this.orderRepository.findBySellerId(sellerId);

    if (!list) {
      this.logger.warn(`Seller not found Seller ID=${sellerId}`);
      throw new NotFoundException(`Seller with ID=${sellerId} not found`);
    }

    return list;

  };

  async getOrderDetails(orderId: string): Promise<Order> {
    this.logger.log(`Fetching details for Order ID=${orderId}`);

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      this.logger.warn(`Order not found Order ID=${orderId}`);
      throw new NotFoundException(`Order with ID=${orderId} not found`);
    }

    return order;
  };

  async updateOrder(
      orderId: OrderPathParamDto,
      updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const session = await this.orderRepository.startTransaction();

    try {
      this.logger.log(`Updating Order ID=${orderId.id}`);
      const order = await this.getOrderDetails(orderId.id);

      if (order.status === OrderStatus.Shipped) {
        throw new BadRequestException(`Cannot modify an Order ID=${orderId.id} after it has been shipped`);
      }

      const updatedOrder = await this.orderRepository.update(order, updateOrderDto, session);

      if (updatedOrder.status === OrderStatus.Shipped) {
        await this.notifyInvoiceService(updatedOrder.id, OrderStatus.Shipped);
      }

      await session.commitTransaction();

      this.logger.log(`Order updated successfully Order ID=${orderId.id}`);

      return updatedOrder;
    } catch (error) {
      this.logger.error('Transaction failed, rolling back...', error.stack);
      await session.abortTransaction();
      this.handleError(`Failed to update Order ID=${orderId.id}`, error);
    } finally {
      await session.endSession();
    }
  };

  private async notifyInvoiceService(orderId: string, action: OrderStatus.Created | OrderStatus.Shipped ): Promise<void> {
    try {
      this.logger.log(`Notifying invoice service: Action=${action}, Order ID=${orderId}`);

      if (action === OrderStatus.Created) {
        await this.invoiceProducer.sendOrderCreated(orderId);
      }

      if (action === OrderStatus.Shipped) {
        await this.invoiceProducer.sendOrderShipped(orderId);
      }

    } catch (error) {
      this.handleError(`Failed to notify invoice service for Order ID=${orderId}, Action=${action}`, error);
    }
  };

  private handleError(message: string, error: Error): never {
    this.logger.error(message, error.stack);
    throw new Error(message);
  };

}