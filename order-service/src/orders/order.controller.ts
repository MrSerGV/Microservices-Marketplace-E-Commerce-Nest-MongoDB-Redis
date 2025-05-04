import { Controller, Post, Get, Patch, Param, Body, ValidationPipe } from '@nestjs/common';

import { OrderService } from './order.service';
import { CreateOrderDto, PathParamDto, UpdateOrderDto } from './order.dto';
import { Order } from './order.schema';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  async createOrder(@Body(ValidationPipe) createOrderDto: CreateOrderDto): Promise<Order> {
    return await this.orderService.createOrder(createOrderDto);
  }

  @Get()
  async listOrders(): Promise<Order[]> {
    return await this.orderService.listOrders();
  }

  @Get(':id')
  async getOrderDetails(@Param(ValidationPipe) id: PathParamDto): Promise<Order> {
    return await this.orderService.getOrderDetails(id);
  }

  @Patch(':id/update')
  async updateOrder(
      @Param(ValidationPipe) id: PathParamDto,
      @Body(ValidationPipe) updateOrderDto: UpdateOrderDto,
  ):Promise<Order> {
    return await this.orderService.updateOrder(id, updateOrderDto);
  }
}
