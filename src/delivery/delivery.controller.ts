import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { DeliveryQuoteRequestDto } from './dto/delivery-quote.dto';
import { DeliveryResponseDto } from './dto/delivery-response.dto';
import type { UberDirectWebhookEvent } from './interfaces/uber-direct.interface';

@ApiTags('Delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('quote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get delivery quote' })
  @ApiResponse({ status: 200, description: 'Quote retrieved successfully' })
  async getQuote(@Body() quoteRequest: DeliveryQuoteRequestDto) {
    return this.deliveryService.getQuote(quoteRequest);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new delivery' })
  @ApiResponse({
    status: 201,
    description: 'Delivery created successfully',
    type: DeliveryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createDelivery(
    @Request() req,
    @Body() createDeliveryDto: CreateDeliveryDto,
  ): Promise<DeliveryResponseDto> {
    return this.deliveryService.createDelivery(req.user.id, createDeliveryDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get delivery by ID' })
  @ApiResponse({
    status: 200,
    description: 'Delivery retrieved successfully',
    type: DeliveryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  async getDelivery(
    @Request() req,
    @Param('id') id: string,
  ): Promise<DeliveryResponseDto> {
    return this.deliveryService.getDelivery(id, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user deliveries' })
  @ApiResponse({
    status: 200,
    description: 'Deliveries retrieved successfully',
    type: [DeliveryResponseDto],
  })
  async getUserDeliveries(
    @Request() req,
    @Query('role') role: 'customer' | 'seller' = 'customer',
  ): Promise<DeliveryResponseDto[]> {
    return this.deliveryService.getUserDeliveries(req.user.id, role);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a delivery' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'Customer requested cancellation' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery canceled successfully',
    type: DeliveryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cannot cancel delivery' })
  async cancelDelivery(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ): Promise<DeliveryResponseDto> {
    return this.deliveryService.cancelDelivery(id, req.user.id, reason);
  }

  @Post('webhooks/uber-direct')
  @ApiOperation({ summary: 'Uber Direct webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleUberDirectWebhook(
    @Body() event: UberDirectWebhookEvent,
    @Headers('x-uber-signature') signature: string,
  ): Promise<{ success: boolean }> {
    // TODO: Verify webhook signature
    // const isValid = this.verifyWebhookSignature(event, signature);
    // if (!isValid) {
    //   throw new BadRequestException('Invalid webhook signature');
    // }

    await this.deliveryService.handleWebhook(event);
    return { success: true };
  }
}
