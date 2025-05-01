import { IsNumber, IsPositive, IsUUID, IsEnum, IsDefined } from 'class-validator';

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
    @IsNumber()
    @IsPositive()
    price: number;

    @IsNumber()
    @IsPositive()
    quantity: number;

    @IsEnum(OrderStatus)
    status: OrderStatus;
}

export class PathParamDto {
    @IsUUID()
    id: string;
}
