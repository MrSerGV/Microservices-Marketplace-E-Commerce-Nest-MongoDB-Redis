import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';

import { CreateOrderDto, PathParamDto } from './order.dto'
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
    }

    async createOrderInstance(createOrderDto: CreateOrderDto, session: ClientSession): Promise<Order> {
        const order = new this.orderModel(createOrderDto);
        order.$session(session);
        return order;
    }

    async save(order: Order, session: ClientSession): Promise<Order> {
        return await order.save({ session });
    }

    async findAll(): Promise<Order[]> {
        return await this.orderModel.find().exec();
    }

    async findById(orderId: PathParamDto): Promise<Order | null> {
        return await this.orderModel.findById(orderId).exec();
    }

    async update(order: Order, updatedFields: Partial<Order>, session: ClientSession): Promise<Order> {
        Object.assign(order, updatedFields);
        return await order.save({ session });
    }
}
