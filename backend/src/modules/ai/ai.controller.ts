import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtGuard } from '../../common/guards/jwt.guard';

@Controller('ai')
@UseGuards(JwtGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('extract-invoice')
  async extractInvoice(@Body() body: { imageUrl: string }) {
    const data = await this.aiService.extractInvoiceData(body.imageUrl);
    return { success: true, data };
  }

  @Post('classify-expense')
  async classifyExpense(@Body() body: { description: string; amount: number }) {
    const category = await this.aiService.classifyExpense(body.description, body.amount);
    return { success: true, category };
  }

  @Get('accounting-advice')
  async getAccountingAdvice(@Request() req) {
    const advice = await this.aiService.getAccountingAdvice({ userId: req.user.userId });
    return { success: true, advice };
  }
}
