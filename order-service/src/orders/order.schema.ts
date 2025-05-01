import { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export enum OrderStatus {
    Created = 'Created',
    Accepted = 'Accepted',
    Rejected = 'Rejected',
    ShippingInProgress = 'Shipping in progress',
    Shipped = 'Shipped',
}

export interface Order extends Document {
    orderId: string;
    price: number;
    quantity: number;
    productId: any;
    customerId: any;
    sellerId: string;
    status: OrderStatus;
}

export const OrderSchema = new Schema({
    orderId: { type: String, required: true, default: uuidv4 },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    productId: { type: Schema.Types.Mixed, required: true },
    customerId: { type: Schema.Types.Mixed, required: true },
    sellerId: { type: String, required: true },
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        required: true,
        default: OrderStatus.Created
    },
});
