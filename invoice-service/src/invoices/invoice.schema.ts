import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class Invoice extends Document {
    @Prop({ required: true, default: () => uuidv4() })
    _id: string = uuidv4();

    @Prop({ required: true, unique: true })
    orderId: string;

    @Prop({ type: Boolean, required: true, default: false })
    isOrderShipped?: boolean;

    @Prop({ type: String, required: false, default: '' })
    pdfPath?: string;

    @Prop({ type: Date, required: false, default: undefined })
    sentAt?: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
