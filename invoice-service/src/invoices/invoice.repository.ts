import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';

import { Invoice } from './invoice.schema';

@Injectable()
export class InvoiceRepository {
    constructor(
        @InjectModel('Invoice') private readonly invoiceModel: Model<Invoice>,
    ) {}

    async startTransaction(): Promise<ClientSession> {
        const session = await this.invoiceModel.db.startSession();
        session.startTransaction();
        return session;
    };

    async createInvoice(orderId: string, session: ClientSession): Promise<Invoice> {
        const invoice = new this.invoiceModel({ orderId, session });
        return await invoice.save({ session });
    }

    async findByOrderId(orderId: string, session: ClientSession): Promise<Invoice | null> {
        return await this.invoiceModel.findOne({ orderId }).session(session).exec();
    };

    async update(invoice: Invoice, updatedFields: Partial<Invoice>, session: ClientSession): Promise<Invoice> {
        Object.assign(invoice, updatedFields);
        return await invoice.save({ session });
    };
}
