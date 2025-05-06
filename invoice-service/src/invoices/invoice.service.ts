
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import * as fs from 'fs';
import { join } from 'path';
import { Readable } from 'stream';

import { InvoiceRepository } from './invoice.repository';
import { Invoice } from './invoice.schema';
import { UpdateInvoiceDto } from './invoice.dto';


@Injectable()
export class InvoiceService {
    private readonly logger = new Logger(InvoiceService.name);

    constructor(
        private readonly invoiceRepository: InvoiceRepository,
    ) {}

    async createInvoice(orderId: string): Promise<Invoice> {
        const session = await this.invoiceRepository.startTransaction();

        try {
            this.logger.log(`Creating a new Invoice with Order ID=${orderId}`);
            const invoice = await this.invoiceRepository.findByOrderId(orderId, session);

            if (invoice) {
                throw new BadRequestException(`Invoice for Order ID=${orderId} already exists`);
            }

            const newInvoice = await this.invoiceRepository.createInvoice(orderId, session);
            await session.commitTransaction();
            return newInvoice;
        } catch (error) {
            this.logger.error('Transaction create Invoice failed, rolling back...', error.stack);
            await session.abortTransaction();
            this.handleError(`Failed to create Invoice for Order ID=${orderId}`, error);
        } finally {
            await session.endSession();
        }
    };

    async getInvoiceByOrderId(orderId: string, session: ClientSession): Promise<Invoice> {
        this.logger.log(`Fetching Invoice with Order ID=${orderId}`);

        const invoice = await this.invoiceRepository.findByOrderId(orderId, session);

        if (!invoice) {
            this.logger.warn(`Invoice with Order ID=${orderId} not found `);
            throw new NotFoundException(`Invoice with Order ID=${orderId} not found`);
        }

        return invoice;
    };

    async updateInvoice(
        invoice: Invoice,
        newData: UpdateInvoiceDto,
        session: ClientSession
    ): Promise<Invoice> {
        try {
            this.logger.log(`Updating Invoice ID=${invoice.id}`);

            const updatedOrder = await this.invoiceRepository.update(invoice, newData, session);

            if (updatedOrder.isOrderShipped && updatedOrder.pdfPath && !updatedOrder.sentAt) {
                await this.sendOut(invoice, session);
                this.logger.log(`Invoice ID=${invoice.id} successfully send out`);
            }

            this.logger.log(`Invoice updated successfully Invoice ID=${invoice.id}`);

            return updatedOrder;
        } catch (error) {
            this.handleError(`Failed to update Invoice ID=${invoice.id}`, error);
        }
    };

    async uploadPdf(orderId: string, pdf: Express.Multer.File): Promise<Invoice> {
        const session = await this.invoiceRepository.startTransaction();

        const uploadDir = join(__dirname, '..', 'uploads')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = join(__dirname, '..', 'uploads', `${Date.now()}-${pdf.originalname}`);

        try {
            this.logger.log(`Uploading PDF for Order ID=${orderId}`);

            const invoice = await this.getInvoiceByOrderId(orderId, session);

            if (invoice.sentAt) {
                throw new BadRequestException(`Cannot upload invoice for Order ID=${orderId} after it has been send out`);
            }

            const readStream = Readable.from(pdf.buffer);
            const writeStream = fs.createWriteStream(filePath);

            await new Promise((resolve, reject) => {
                readStream.pipe(writeStream);

                readStream.on('end', () => resolve(true));

                readStream.on('error', (error) => {
                    reject(new Error(`Error reading file for Invoice with Order ID=${orderId}: ${error.message}`));
                });
            });

            const updatedInvoice = await this.updateInvoice(invoice, { pdfPath: filePath }, session);

            await session.commitTransaction();

            return updatedInvoice;
        } catch (error) {
            this.logger.error('Transaction upload PDF failed, rolling back...', error.stack);
            await session.abortTransaction();

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            throw new BadRequestException(`Error upload file for Invoice with Order ID=${orderId}`);
        } finally {
            await session.endSession();
        }
    };

    async markOrderShipped(orderId: string): Promise<Invoice> {
        const session = await this.invoiceRepository.startTransaction();
        const invoice = await this.getInvoiceByOrderId(orderId, session);
        try {
            this.logger.log(`Marking order as shipped at invoice Order ID=${orderId}`);

            const updatedInvoice = await this.updateInvoice(invoice, { isOrderShipped: true }, session);

            await session.commitTransaction();

            return updatedInvoice;
        } catch (error) {
            this.logger.error('Transaction markOrderShipped failed, rolling back...', error.stack);
            await session.abortTransaction();
            this.handleError(`Failed to marking order as shipped at Invoice ID=${invoice.id}`, error);
        } finally {
            await session.endSession();
        }
    };

    async sendOut(invoice: Invoice, session: ClientSession) {
        try {
            this.logger.log(`Sending out Invoice ID=${invoice.id}`);
            return await this.updateInvoice(invoice, { sentAt: new Date() }, session);
        } catch (error) {
            this.handleError(`Failed to sending out Invoice ID=${invoice.id}`, error);
        }

    };

    private handleError(message: string, error: Error): never {
        this.logger.error(message, error.stack);
        throw new Error(message);
    };
}
