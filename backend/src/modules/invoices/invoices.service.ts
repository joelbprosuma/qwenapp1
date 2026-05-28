import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus, InvoiceType } from '../../entities/invoice.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    private aiService: AiService,
  ) {}

  async createInvoice(invoiceData: any, userId: string, fileUrl?: string) {
    let ocrData = null;
    let extractedData = null;

    if (fileUrl) {
      extractedData = await this.aiService.extractInvoiceData(fileUrl);
      ocrData = JSON.stringify(extractedData);
    }

    const invoice = this.invoiceRepository.create({
      ...invoiceData,
      ...(extractedData || {}),
      imageUrl: fileUrl,
      ocrData,
      userId,
    });

    return await this.invoiceRepository.save(invoice);
  }

  async findAllByUser(userId: string, filters?: any) {
    const query = this.invoiceRepository.createQueryBuilder('invoice')
      .where('invoice.userId = :userId', { userId })
      .orderBy('invoice.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('invoice.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('invoice.type = :type', { type: filters.type });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('invoice.createdAt BETWEEN :start AND :end', {
        start: filters.startDate,
        end: filters.endDate,
      });
    }

    return await query.getMany();
  }

  async findOne(id: string, userId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, userId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateStatus(id: string, status: InvoiceStatus, userId: string) {
    const invoice = await this.findOne(id, userId);
    invoice.status = status;
    if (status === InvoiceStatus.PAID) {
      invoice.paidDate = new Date();
    }
    return await this.invoiceRepository.save(invoice);
  }

  async remove(id: string, userId: string) {
    const invoice = await this.findOne(id, userId);
    await this.invoiceRepository.remove(invoice);
    return { success: true };
  }

  async getOverdueInvoices(userId: string) {
    return await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.userId = :userId', { userId })
      .andWhere('invoice.status != :paid', { paid: InvoiceStatus.PAID })
      .andWhere('invoice.dueDate < :now', { now: new Date() })
      .getMany();
  }

  async getAnalytics(userId: string) {
    const invoices = await this.findAllByUser(userId);
    
    const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount as any), 0);
    const pendingAmount = invoices
      .filter(inv => inv.status === InvoiceStatus.PENDING)
      .reduce((sum, inv) => sum + parseFloat(inv.amount as any), 0);
    const paidAmount = invoices
      .filter(inv => inv.status === InvoiceStatus.PAID)
      .reduce((sum, inv) => sum + parseFloat(inv.amount as any), 0);

    const byCategory = invoices.reduce((acc, inv) => {
      acc[inv.category || 'Non catégorisé'] = (acc[inv.category || 'Non catégorisé'] || 0) + parseFloat(inv.amount as any);
      return acc;
    }, {});

    return {
      totalInvoices: invoices.length,
      totalAmount,
      pendingAmount,
      paidAmount,
      overdueCount: invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length,
      byCategory,
    };
  }
}
