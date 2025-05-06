import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';

import { CreateOrderDto, OrderPathParamDto, SellerPathParamDto } from './order.dto'
import { Order } from './order.schema';

@Injectable()
export class OrderRepository {
    constructor(
        @InjectModel('Order') private readonly orderModel: Model<Order>,
    ) {}

    async startTransaction(): Promise<ClientSession> {
        const session = await this.orderModel.db.startSession();
        session.startTransaction();
        return session;
    };

    async createAndSaveOrder(createOrderDto: CreateOrderDto,session: ClientSession): Promise<Order> {
        const order = new this.orderModel(createOrderDto);
        return await order.save({ session });
    };

    async findBySellerId(sellerId: string): Promise<Order[]> {
        return await this.orderModel.find({ sellerId: sellerId }).exec();
    };

    async findById(orderId: string): Promise<Order | null> {
        return await this.orderModel.findById(orderId).exec();
    };

    async update(order: Order, updatedFields: Partial<Order>, session: ClientSession): Promise<Order> {
        Object.assign(order, updatedFields);
        return await order.save({ session });
    };
}
