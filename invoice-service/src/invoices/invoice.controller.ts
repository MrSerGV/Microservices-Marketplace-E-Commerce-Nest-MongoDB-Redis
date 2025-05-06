import { Controller, UseInterceptors, Patch, Param, UploadedFile, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { InvoiceService } from './invoice.service';
import { PathParamDto } from './invoice.dto';
import { Invoice } from './invoice.schema';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Patch(':orderId/upload-pdf')
  @UseInterceptors(FileInterceptor('pdf', {
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadPdf(
      @Param(ValidationPipe) params: PathParamDto,
      @UploadedFile(ValidationPipe) file: Express.Multer.File,
  ):Promise<Invoice> {
    return await this.invoiceService.uploadPdf(params.orderId, file);
  };
}
