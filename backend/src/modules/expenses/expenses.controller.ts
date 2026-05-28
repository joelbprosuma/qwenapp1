import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ExpensesService } from './expenses.service';
import { JwtGuard } from '../../common/guards/jwt.guard';

@Controller('expenses')
@UseGuards(JwtGuard)
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

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
  async createExpense(
    @Request() req,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const expenseData = {
      description: body.description,
      amount: parseFloat(body.amount),
      currency: body.currency || 'XOF',
      merchantName: body.merchantName,
      category: body.category,
      notes: body.notes,
      expenseDate: body.expenseDate,
    };

    const fileUrl = file ? `/uploads/${file.filename}` : null;
    const expense = await this.expensesService.createExpense(expenseData, req.user.userId, fileUrl);

    return { success: true, data: expense };
  }

  @Get()
  async findAll(@Request() req, @Body() filters?: any) {
    const expenses = await this.expensesService.findAllByUser(req.user.userId, filters);
    return { success: true, data: expenses };
  }

  @Get('analytics')
  async getAnalytics(@Request() req) {
    const analytics = await this.expensesService.getAnalytics(req.user.userId);
    return { success: true, data: analytics };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const expense = await this.expensesService.findOne(id, req.user.userId);
    return { success: true, data: expense };
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    const expense = await this.expensesService.update(id, updateData, req.user.userId);
    return { success: true, data: expense };
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const result = await this.expensesService.remove(id, req.user.userId);
    return result;
  }
}
