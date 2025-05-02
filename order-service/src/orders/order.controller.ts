import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';

import { OrderService } from './order.service';
import { CreateOrderDto, PathParamDto, UpdateOrderDto } from './order.dto';
import { Order } from './order.schema';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return await this.orderService.createOrder(createOrderDto);
  }

  @Get()
  async listOrders(): Promise<Order[]> {
    return await this.orderService.listOrders();
  }

  @Get(':id')
  async getOrderDetails(@Param('id') id: PathParamDto): Promise<Order> {
    return await this.orderService.getOrderDetails(id);
  }

  @Patch(':id/update')
  async updateOrder(
      @Param('id') id: PathParamDto,
      @Body() updateOrderDto: UpdateOrderDto,
  ):Promise<Order> {
    return await this.orderService.updateOrder(id, updateOrderDto);
  }
}
