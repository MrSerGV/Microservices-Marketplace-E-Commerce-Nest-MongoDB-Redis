import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export enum OrderStatus {
    Created = 'Created',
    Accepted = 'Accepted',
    Rejected = 'Rejected',
    ShippingInProgress = 'Shipping in progress',
    Shipped = 'Shipped',
}

@Schema()
export class Order extends Document {
    @Prop({ required: true, default: () => uuidv4() })
    _id: string = uuidv4();

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    quantity: number;

    @Prop({ type: Object, required: true })
    productId: any;

    @Prop({ type: Object, required: true })
    customerId: any;

    @Prop({ required: true })
    sellerId: string;

    @Prop({ type: String, enum: Object.values(OrderStatus), required: true, default: OrderStatus.Created })
    status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
