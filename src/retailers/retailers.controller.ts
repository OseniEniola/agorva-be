import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateRetailerDto } from './dto/create-retailer-dto';
import { RetailersService } from './retailers.service';
import { UpdateRetailerDto } from './dto/update-retailer-dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('retailers')
export class RetailerController {
  constructor(private readonly retailerService: RetailersService) {}

  @Post('profile')
  createRetailerProfile(@Req() req, @Body() dto: CreateRetailerDto) {
    const userId = req.user.id;
    return this.retailerService.createRetailer(userId, dto);
  }

  @Get('me')
  getMyRetailer(@Req() req) {
    const userId = req.user.id;
    return this.retailerService.getRetailerByUserId(userId);
  }

  @UseGuards(RolesGuard)
  @Put('profile')
  @Roles(UserRole.RETAILER)
  updateMyRetailer(@Req() req, @Body() dto: UpdateRetailerDto) {
    const userId = req.user.userId;
    return this.retailerService.updateRetailerProfile(userId, dto);
  }
}
