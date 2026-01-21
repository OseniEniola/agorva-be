import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ResponseUtil } from '../common/utils/response.util';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BulkCreateProductsDto, BulkDeleteProductsDto, BulkOperationResultDto } from './dto/bulk-operations.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.FARMER, UserRole.RETAILER)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create a product',
    description: 'Farmers and retailers can create new products for sale'
  })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only farmers and retailers can create products' })
  async create(
    @CurrentUser() user: any,
    @Body() createProductDto: CreateProductDto,
  ) {
    // Determine seller type from user role
    const sellerType = user.role === UserRole.FARMER ? 'farmer' : 'retailer';

    const product = await this.productsService.create(
      user.userId,
      sellerType,
      createProductDto,
    );
    return ResponseUtil.success(product, 'Product created successfully');
  }

  @Public()
  @Get()
   @ApiOperation({ 
    summary: 'Get all products',
    description: 'Retrieve paginated list of products with filters'
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, enum: ['vegetables', 'fruits', 'meat', 'dairy'] })
  @ApiQuery({ name: 'halal', required: false, type: Boolean })
  @ApiQuery({ name: 'kosher', required: false, type: Boolean })
  @ApiQuery({ name: 'organic', required: false, type: Boolean })
  @ApiQuery({ name: 'localOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findAll(@Query() queryDto: ProductQueryDto) {
    const { data, total } = await this.productsService.findAll(queryDto);
    return ResponseUtil.paginated(
      data,
      queryDto.page || 1,
      queryDto.limit || 20,
      total,
      'Products retrieved successfully',
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get product by ID',
    description: 'Retrieve detailed product information'
  })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return ResponseUtil.success(product, 'Product retrieved successfully');
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ 
    summary: 'Get product by slug',
    description: 'Retrieve product by SEO-friendly slug'
  })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findBySlug(@Param('slug') slug: string) {
    const product = await this.productsService.findBySlug(slug);
    return ResponseUtil.success(product, 'Product retrieved successfully');
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.FARMER, UserRole.RETAILER)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update product',
    description: 'Update your own product. Only the seller can update their products.'
  })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only update your own products' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(
      id,
      user.userId,
      updateProductDto,
    );
    return ResponseUtil.success(product, 'Product updated successfully');
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.FARMER, UserRole.RETAILER)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Delete product',
    description: 'Delete your own product (soft delete)'
  })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only delete your own products' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.productsService.remove(id, user.userId);
    return ResponseUtil.success(null, 'Product deleted successfully');
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.CONSUMER, UserRole.RETAILER)
  @Post(':id/reviews')
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Add product review',
    description: 'Consumers and retailers can review products'
  })
  @ApiResponse({ status: 201, description: 'Review added successfully' })
  @ApiResponse({ status: 403, description: 'You have already reviewed this product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async addReview(
    @Param('id') productId: string,
    @CurrentUser() user: any,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    const review = await this.productsService.addReview(
      productId,
      user.userId,
      createReviewDto,
    );
    return ResponseUtil.success(review, 'Review added successfully');
  }

  @Post('bulk/upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk create products from file (CSV or Excel)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async bulkUploadProducts(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<BulkOperationResultDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only CSV and Excel files are allowed');
    }

    let productsData;

    if (file.mimetype === 'text/csv') {
      productsData = await this.productsService.parseCsvFile(file.buffer);
    } else {
      productsData = await this.productsService.parseExcelFile(file.buffer);
    }

    return this.productsService.bulkCreateProducts(
      productsData,
      req.user.id,
      req.user.userType,
    );
  }

  @Post('bulk/create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk create products from JSON data' })
  async bulkCreateProducts(
    @Body() bulkCreateDto: BulkCreateProductsDto,
    @Request() req,
  ): Promise<BulkOperationResultDto> {
    return this.productsService.bulkCreateProducts(
      bulkCreateDto.products,
      req.user.id,
      req.user.userType,
    );
  }

  @Delete('bulk/delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk delete products' })
  async bulkDeleteProducts(
    @Body() bulkDeleteDto: BulkDeleteProductsDto,
    @Request() req,
  ): Promise<BulkOperationResultDto> {
    return this.productsService.bulkDeleteProducts(
      bulkDeleteDto.productIds,
      req.user.id,
      req.user.userType,
    );
  }

  @Get('bulk/template')
  @ApiOperation({ summary: 'Download bulk upload template' })
  async downloadTemplate(
    @Query('format') format: 'csv' | 'xlsx' = 'csv',
    @Res() res: Response,
  ): Promise<void> {
    const buffer = this.productsService.generateTemplate(format);

    const filename = `product-upload-template.${format}`;
    const contentType = format === 'csv' 
      ? 'text/csv' 
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
