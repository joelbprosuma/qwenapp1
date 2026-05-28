import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { InvoicesService } from './invoices.service';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { InvoiceStatus, InvoiceType } from '../../entities/invoice.entity';

@Controller('invoices')
@UseGuards(JwtGuard)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async createInvoice(
    @Request() req,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const invoiceData = {
      invoiceNumber: body.invoiceNumber,
      type: body.type || InvoiceType.PURCHASE,
      amount: parseFloat(body.amount),
      currency: body.currency || 'XOF',
      supplierName: body.supplierName,
      customerName: body.customerName,
      description: body.description,
      category: body.category,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    };

    const fileUrl = file ? `/uploads/${file.filename}` : null;
    const invoice = await this.invoicesService.createInvoice(invoiceData, req.user.userId, fileUrl);

    return { success: true, data: invoice };
  }

  @Get()
  async findAll(@Request() req, @Body() filters?: any) {
    const invoices = await this.invoicesService.findAllByUser(req.user.userId, filters);
    return { success: true, data: invoices };
  }

  @Get('analytics')
  async getAnalytics(@Request() req) {
    const analytics = await this.invoicesService.getAnalytics(req.user.userId);
    return { success: true, data: analytics };
  }

  @Get('overdue')
  async getOverdue(@Request() req) {
    const invoices = await this.invoicesService.getOverdueInvoices(req.user.userId);
    return { success: true, data: invoices };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const invoice = await this.invoicesService.findOne(id, req.user.userId);
    return { success: true, data: invoice };
  }

  @Put(':id/status')
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { status: InvoiceStatus },
  ) {
    const invoice = await this.invoicesService.updateStatus(id, body.status, req.user.userId);
    return { success: true, data: invoice };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const result = await this.invoicesService.remove(id, req.user.userId);
    return result;
  }
}
