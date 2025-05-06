import { IsNumber, IsPositive, IsUUID, IsDefined, IsIn, IsOptional } from 'class-validator';

import { OrderStatus } from './order.schema';

export class CreateOrderDto {
    @IsNumber()
    @IsPositive()
    price: number;

    @IsNumber()
    @IsPositive()
    quantity: number;

    @IsDefined()
    productId: any;

    @IsDefined()
    customerId: any;

    @IsUUID()
    sellerId: string;
}

export class UpdateOrderDto {
    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    quantity?: number;

    @IsOptional()
    @IsIn(Object.values(OrderStatus).filter(status => status !== OrderStatus.Created))
    status?: OrderStatus;
}

export class OrderPathParamDto {
    @IsUUID('4', { message: 'Order ID must be a valid UUID version 4' })
    id: string;
}

export class SellerPathParamDto {
    sellerId: string;
}
