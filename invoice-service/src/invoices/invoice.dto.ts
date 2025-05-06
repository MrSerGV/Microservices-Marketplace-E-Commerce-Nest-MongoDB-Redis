import { IsDate, IsUUID, IsBoolean, IsString, IsOptional } from 'class-validator';

export class UpdateInvoiceDto {
    @IsOptional()
    @IsString()
    pdfPath?: string;

    @IsOptional()
    @IsBoolean()
    isOrderShipped?: boolean;

    @IsOptional()
    @IsDate()
    sentAt?: Date;
}

export class PathParamDto {
    @IsUUID('4', { message: 'Order ID must be a valid UUID version 4' })
    orderId: string;
}