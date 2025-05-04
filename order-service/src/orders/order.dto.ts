import { IsNumber, IsPositive, IsUUID, IsDefined, IsIn } from 'class-validator';

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

    @IsIn(Object.values(OrderStatus).filter(status => status !== OrderStatus.Created))
    status: OrderStatus;
}

export class PathParamDto {
    @IsUUID('4', { message: 'ID must be a valid UUID version 4' })
    id: string;
}
