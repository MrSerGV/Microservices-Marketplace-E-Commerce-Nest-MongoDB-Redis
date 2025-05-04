import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';

import { OrderRepository } from './order.repository';
import { CreateOrderDto, PathParamDto, UpdateOrderDto } from './order.dto';
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
      const orderInstance = await this.orderRepository.createOrderInstance(createOrderDto, session);

      const savedOrder = await this.orderRepository.save(orderInstance, session);

      await this.notifyInvoiceService(savedOrder.orderId, OrderStatus.Created);

      await session.commitTransaction();

      return savedOrder;
    } catch (error) {
      this.logger.error('Transaction failed, rolling back...', error.stack);
      await session.abortTransaction();
      this.handleError('Failed to create order', error);
    } finally {
      await session.endSession();
    }
  }

  async listOrders(): Promise<Order[]> {
    this.logger.log('Fetching all orders');
    return await this.orderRepository.findAll();
  }

  async getOrderDetails(orderId: PathParamDto): Promise<Order> {
    this.logger.log(`Fetching details for order ID: ${orderId}`);

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      this.logger.warn(`Order not found: ${orderId}`);
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async updateOrder(
      orderId: PathParamDto,
      updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const session = await this.orderRepository.startTransaction();

    try {
      this.logger.log(`Updating order ID: ${orderId}`);
      const order = await this.getOrderDetails(orderId);

      if (order.status === OrderStatus.Shipped && updateOrderDto.status !== OrderStatus.Shipped) {
        throw new BadRequestException('Cannot modify an order after it has been shipped');
      }

      const updatedOrder = await this.orderRepository.update(order, updateOrderDto, session);

      if (order.status === OrderStatus.Shipped) {
        await this.notifyInvoiceService(updatedOrder.orderId, OrderStatus.Shipped);
      }

      await session.commitTransaction();

      this.logger.log(`Order updated successfully: ${orderId}`);

      return updatedOrder;
    } catch (error) {
      this.logger.error('Transaction failed, rolling back...', error.stack);
      await session.abortTransaction();
      this.handleError('Failed to update order', error);
    } finally {
      await session.endSession();
    }

  }

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
      this.handleError(`Failed to notify invoice service for Order ID: ${orderId}, Action=${action}`, error);
    }
  }

  private handleError(message: string, error: Error): never {
    this.logger.error(message, error.stack);
    throw new Error(message);
  }

}