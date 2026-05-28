import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense, ExpenseCategory } from '../../entities/expense.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    private aiService: AiService,
  ) {}

  async createExpense(expenseData: any, userId: string, fileUrl?: string) {
    let category = expenseData.category;
    let ocrData = null;

    // Auto-classify with AI if no category provided
    if (!category && expenseData.description) {
      category = await this.aiService.classifyExpense(
        expenseData.description,
        parseFloat(expenseData.amount),
      );
    }

    const expense = this.expenseRepository.create({
      ...expenseData,
      category: category || ExpenseCategory.AUTRE,
      imageUrl: fileUrl,
      ocrData,
      userId,
      expenseDate: expenseData.expenseDate ? new Date(expenseData.expenseDate) : new Date(),
    });

    return await this.expenseRepository.save(expense);
  }

  async findAllByUser(userId: string, filters?: any) {
    const query = this.expenseRepository.createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId })
      .orderBy('expense.expenseDate', 'DESC');

    if (filters?.category) {
      query.andWhere('expense.category = :category', { category: filters.category });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('expense.expenseDate BETWEEN :start AND :end', {
        start: filters.startDate,
        end: filters.endDate,
      });
    }

    return await query.getMany();
  }

  async findOne(id: string, userId: string) {
    const expense = await this.expenseRepository.findOne({
      where: { id, userId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async update(id: string, updateData: any, userId: string) {
    const expense = await this.findOne(id, userId);
    Object.assign(expense, updateData);
    return await this.expenseRepository.save(expense);
  }

  async remove(id: string, userId: string) {
    const expense = await this.findOne(id, userId);
    await this.expenseRepository.remove(expense);
    return { success: true };
  }

  async getAnalytics(userId: string) {
    const expenses = await this.findAllByUser(userId);
    
    const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount as any), 0);

    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount as any);
      return acc;
    }, {});

    const byMonth = expenses.reduce((acc, exp) => {
      const month = new Date(exp.expenseDate).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + parseFloat(exp.amount as any);
      return acc;
    }, {});

    return {
      totalExpenses: expenses.length,
      totalAmount,
      byCategory,
      byMonth,
      averageExpense: expenses.length > 0 ? totalAmount / expenses.length : 0,
    };
  }
}
