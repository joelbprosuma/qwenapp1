import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../../common/guards/jwt.guard';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.userId);
    return { success: true, data: user };
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateData: any) {
    const user = await this.usersService.update(req.user.userId, updateData);
    return { success: true, data: user };
  }

  @Get('dashboard')
  async getDashboard(@Request() req) {
    const dashboard = await this.usersService.getDashboardData(req.user.userId);
    return { success: true, data: dashboard };
  }
}
