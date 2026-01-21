import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { Product } from './entities/products-entity';
import { ProductImage } from './entities/product-image-entity';
import { Review } from './entities/product-review-entity';
import { ProductStatus } from 'src/common/enums/products-enum';
import {
  BulkOperationResultDto,
  BulkProductDto,
} from './dto/bulk-operations.dto';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,

    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async create(
    sellerId: string,
    sellerType: 'farmer' | 'retailer',
    createProductDto: CreateProductDto,
  ): Promise<Product> {
    // Generate slug from name
    const slug = this.generateSlug(createProductDto.name);

    const product = this.productsRepository.create({
      ...createProductDto,
      sellerId,
      sellerType,
      slug,
      status: createProductDto.status || ProductStatus.DRAFT,
    });

    const savedProduct = await this.productsRepository.save(product);

    // Add images if provided
    if (createProductDto.imageUrls && createProductDto.imageUrls.length > 0) {
      const images = createProductDto.imageUrls.map((url, index) => {
        return this.productImagesRepository.create({
          productId: savedProduct.id,
          url,
          sortOrder: index,
          isPrimary: index === 0,
        });
      });
      await this.productImagesRepository.save(images);
    }

    return this.findOne(savedProduct.id);
  }

  async findAll(queryDto: ProductQueryDto) {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      search,
      minPrice,
      maxPrice,
      farmerId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      minRating,
    } = queryDto;

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.seller', 'seller');

    // Filters
    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    } else {
      // Default: only show active products for public
      queryBuilder.andWhere('product.status = :status', {
        status: ProductStatus.ACTIVE,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.tags::text ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (farmerId) {
      queryBuilder.andWhere('product.sellerId = :farmerId', { farmerId });
    }

    // Filter by seller type
    if (queryDto.sellerType) {
      queryBuilder.andWhere('product.sellerType = :sellerType', {
        sellerType: queryDto.sellerType,
      });
    }

    // Filter by condition
    if (queryDto.condition) {
      queryBuilder.andWhere('product.condition = :condition', {
        condition: queryDto.condition,
      });
    }

    // Filter by origin
    if (queryDto.origin) {
      queryBuilder.andWhere('product.origin = :origin', {
        origin: queryDto.origin,
      });
    }

    // Filter by certifications
    if (queryDto.halal) {
      queryBuilder.andWhere(':halal = ANY(product.certifications)', {
        halal: 'halal',
      });
    }

    if (queryDto.kosher) {
      queryBuilder.andWhere(':kosher = ANY(product.certifications)', {
        kosher: 'kosher',
      });
    }

    if (queryDto.organic) {
      queryBuilder.andWhere(
        '(:organic = ANY(product.certifications) OR :certifiedOrganic = ANY(product.certifications))',
        { organic: 'organic', certifiedOrganic: 'certified_organic' },
      );
    }

    // Filter local products only
    if (queryDto.localOnly) {
      queryBuilder.andWhere('product.origin = :localOrigin', {
        localOrigin: 'local',
      });
    }

    // Filter imperfect/discounted produce
    if (queryDto.imperfectProduce) {
      queryBuilder.andWhere('product.condition IN (:...imperfectConditions)', {
        imperfectConditions: [
          'imperfect',
          'slightly_damaged',
          'overripe',
          'fair',
        ],
      });
    }

    if (minRating) {
      queryBuilder.andWhere('product.averageRating >= :minRating', {
        minRating,
      });
    }

    // Sorting
    const validSortFields = [
      'price',
      'createdAt',
      'name',
      'averageRating',
      'salesCount',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`product.${sortField}`, sortOrder);

    // Pagination
    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['images', 'seller', 'reviews', 'reviews.user'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.productsRepository.increment({ id }, 'viewCount', 1);

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { slug },
      relations: ['images', 'seller', 'reviews', 'reviews.user'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: string,
    sellerId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('You can only update your own products');
    }

    // Update slug if name changed
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      updateProductDto['slug'] = this.generateSlug(updateProductDto.name);
    }

    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async remove(id: string, sellerId: string): Promise<void> {
    const product = await this.findOne(id);

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.productsRepository.softDelete(id);
  }

  async addReview(
    productId: string,
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const product = await this.findOne(productId);

    // Check if user already reviewed
    const existingReview = await this.reviewsRepository.findOne({
      where: { productId, userId },
    });

    if (existingReview) {
      throw new ForbiddenException('You have already reviewed this product');
    }

    const review = this.reviewsRepository.create({
      ...createReviewDto,
      productId,
      userId,
    });

    const savedReview = await this.reviewsRepository.save(review);

    // Update product average rating
    await this.updateProductRating(productId);

    return savedReview;
  }

  private async updateProductRating(productId: string): Promise<void> {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.productId = :productId', { productId })
      .getRawOne();

    await this.productsRepository.update(productId, {
      averageRating: parseFloat(result.avgRating) || 0,
      reviewCount: parseInt(result.count) || 0,
    });
  }

  private generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now()
    );
  }

  /**
   * Bulk create products from array of product data
   */
  async bulkCreateProducts(
    productsData: BulkProductDto[],
    userId: string,
    userType: 'farmer' | 'retailer',
  ): Promise<BulkOperationResultDto> {
    const result: BulkOperationResultDto = {
      totalProcessed: productsData.length,
      successful: 0,
      failed: 0,
      errors: [],
      createdIds: [],
    };

    for (let i = 0; i < productsData.length; i++) {
      try {
        const productData = productsData[i];

        // Generate unique slug
        const baseSlug = slugify(productData.name, {
          lower: true,
          strict: true,
        });
        let slug = baseSlug;
        let counter = 1;

        while (await this.productsRepository.findOne({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Create product
        const product = this.productsRepository.create({
          ...productData,
          sellerId: userId,
          sellerType: userType,
          slug,
          status: ProductStatus.ACTIVE,
          isAvailable: true,
        });

        const savedProduct = await this.productsRepository.save(product);

        // Handle images if provided
        if (productData.imageUrls && productData.imageUrls.length > 0) {
          const images = productData.imageUrls.map((url, index) => {
            return this.productImagesRepository.create({
              product: { id: savedProduct.id },
              url,
              altText: productData.name,
              isPrimary: index === 0,
              sortOrder: index,
            });
          });
          await this.productImagesRepository.save(images);
        }

        result.successful++;
        result.createdIds && result.createdIds.push(savedProduct.id);
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          error: error.message || 'Unknown error occurred',
        });
      }
    }

    return result;
  }

  /**
   * Parse Excel file to product data
   */
  async parseExcelFile(buffer: Buffer): Promise<BulkProductDto[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

      return this.mapRowsToProducts(jsonData);
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse Excel file: ${error.message}`,
      );
    }
  }

  /**
   * Parse CSV file to product data
   */
  async parseCsvFile(buffer: Buffer): Promise<BulkProductDto[]> {
    try {
      const csvString = buffer.toString('utf-8');

      const parsed = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      });

      if (parsed.errors.length > 0) {
        throw new BadRequestException(
          `CSV parsing errors: ${JSON.stringify(parsed.errors)}`,
        );
      }

      return this.mapRowsToProducts(parsed.data);
    } catch (error) {
      throw new BadRequestException(
        `Failed to parse CSV file: ${error.message}`,
      );
    }
  }

  /**
   * Map spreadsheet rows to product DTOs
   */
  private mapRowsToProducts(rows: any[]): BulkProductDto[] {
    return rows.map((row) => {
      // Parse tags (comma-separated string to array)
      const tags = row.tags
        ? row.tags.split(',').map((tag: string) => tag.trim())
        : [];

      // Parse certifications (comma-separated string to array)
      const certifications = row.certifications
        ? row.certifications.split(',').map((cert: string) => cert.trim())
        : [];

      // Parse image URLs (comma-separated string to array)
      const imageUrls = row.imageUrls
        ? row.imageUrls.split(',').map((url: string) => url.trim())
        : [];

      return {
        name: row.name,
        description: row.description,
        shortDescription: row.shortDescription || undefined,
        category: row.category,
        price: parseFloat(row.price),
        compareAtPrice: row.compareAtPrice
          ? parseFloat(row.compareAtPrice)
          : undefined,
        quantity: parseInt(row.quantity, 10),
        unit: row.unit,
        minOrderQuantity: parseInt(row.minOrderQuantity, 10),
        maxOrderQuantity: row.maxOrderQuantity
          ? parseInt(row.maxOrderQuantity, 10)
          : undefined,
        sku: row.sku || undefined,
        barcode: row.barcode || undefined,
        tags,
        certifications,
        condition: row.condition,
        conditionNotes: row.conditionNotes || undefined,
        businessName: row.businessName || undefined,
        originLocation: row.originLocation || undefined,
        origin: row.origin,
        harvestDate: row.harvestDate || undefined,
        expiryDate: row.expiryDate || undefined,
        storageType: row.storageType,
        requiresRefrigeration:
          row.requiresRefrigeration === 'true' ||
          row.requiresRefrigeration === true,
        shippingMethod: row.shippingMethod,
        isShippable: row.isShippable === 'true' || row.isShippable === true,
        pickupOnly: row.pickupOnly === 'true' || row.pickupOnly === true,
        weight: row.weight ? parseFloat(row.weight) : undefined,
        isFragile: row.isFragile === 'true' || row.isFragile === true,
        isPerishable: row.isPerishable === 'true' || row.isPerishable === true,
        imageUrls,
      };
    });
  }

  /**
   * Bulk delete products
   */
  async bulkDeleteProducts(
    productIds: string[],
    userId: string,
    userType: 'farmer' | 'retailer',
  ): Promise<BulkOperationResultDto> {
    const result: BulkOperationResultDto = {
      totalProcessed: productIds.length,
      successful: 0,
      failed: 0,
      errors: [],
      deletedIds: [],
    };

    for (const productId of productIds) {
      try {
        const product = await this.productsRepository.findOne({
          where: { id: productId },
        });

        if (!product) {
          result.failed++;
          result.errors.push({
            productId,
            error: 'Product not found',
          });
          continue;
        }

        // Check ownership
        if (product.sellerId !== userId) {
          result.failed++;
          result.errors.push({
            productId,
            error: 'You do not have permission to delete this product',
          });
          continue;
        }

        // Soft delete
        await this.productsRepository.update(productId, {
          deletedAt: new Date(),
        });

        result.successful++;
        result.deletedIds && result.deletedIds.push(productId);
      } catch (error) {
        result.failed++;
        result.errors.push({
          productId,
          error: error.message || 'Unknown error occurred',
        });
      }
    }

    return result;
  }

  /**
   * Generate template file for bulk upload
   */
  generateTemplate(format: 'csv' | 'xlsx'): Buffer {
    const headers = [
      'name',
      'description',
      'shortDescription',
      'category',
      'price',
      'compareAtPrice',
      'quantity',
      'unit',
      'minOrderQuantity',
      'maxOrderQuantity',
      'sku',
      'barcode',
      'tags',
      'certifications',
      'condition',
      'conditionNotes',
      'businessName',
      'originLocation',
      'origin',
      'harvestDate',
      'expiryDate',
      'storageType',
      'requiresRefrigeration',
      'shippingMethod',
      'isShippable',
      'pickupOnly',
      'weight',
      'isFragile',
      'isPerishable',
      'imageUrls',
    ];

    const sampleData = {
      name: 'Fresh Organic Tomatoes',
      description: 'Vine-ripened organic tomatoes grown without pesticides',
      shortDescription: 'Fresh organic tomatoes',
      category: 'VEGETABLES',
      price: '4.99',
      compareAtPrice: '5.99',
      quantity: '100',
      unit: 'KG',
      minOrderQuantity: '1',
      maxOrderQuantity: '50',
      sku: 'TOM-ORG-001',
      barcode: '123456789012',
      tags: 'organic,fresh,local',
      certifications: 'ORGANIC,NON_GMO',
      condition: 'FRESH',
      conditionNotes: '',
      businessName: 'Green Valley Farm',
      originLocation: 'California',
      origin: 'LOCAL',
      harvestDate: '2024-01-15',
      expiryDate: '2024-01-25',
      storageType: 'REFRIGERATED',
      requiresRefrigeration: 'true',
      shippingMethod: 'REFRIGERATED',
      isShippable: 'true',
      pickupOnly: 'false',
      weight: '1.5',
      isFragile: 'false',
      isPerishable: 'true',
      imageUrls:
        'https://example.com/image1.jpg,https://example.com/image2.jpg',
    };

    if (format === 'csv') {
      const csv = Papa.unparse([sampleData], { header: true });
      return Buffer.from(csv, 'utf-8');
    } else {
      const worksheet = XLSX.utils.json_to_sheet([sampleData]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
  }
}
