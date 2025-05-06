import { Controller, Post, Get, Patch, Param, Body, ValidationPipe } from '@nestjs/common';

import { OrderService } from './order.service';
import { CreateOrderDto, OrderPathParamDto, SellerPathParamDto, UpdateOrderDto} from './order.dto';
import { Order } from './order.schema';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  async createOrder(@Body(ValidationPipe) createOrderDto: CreateOrderDto): Promise<Order> {
    return await this.orderService.createOrder(createOrderDto);
  };

  @Get('seller/:sellerId')
  async listOrders(@Param(ValidationPipe) params: SellerPathParamDto): Promise<Order[]> {
    return await this.orderService.listOrdersBySellerId(params.sellerId);
  };

  @Get(':id')
  async getOrderDetails(@Param(ValidationPipe) params: OrderPathParamDto): Promise<Order> {
    return await this.orderService.getOrderDetails(params.id);
  };

  @Patch(':id/update')
  async updateOrder(
      @Param(ValidationPipe) id: OrderPathParamDto,
      @Body(ValidationPipe) newData: UpdateOrderDto,
  ):Promise<Order> {
    return await this.orderService.updateOrder(id, newData);
  };
}
