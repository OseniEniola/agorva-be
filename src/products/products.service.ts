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
import { SearchProductsDto, SearchSortBy } from './dto/search-products.dto';
import {
  ProductSearchResponseDto,
  ProductSearchResultDto,
} from './dto/search-results.dto';
import { Product } from './entities/products-entity';
import { ProductImage } from './entities/product-image-entity';
import { Review } from './entities/product-review-entity';
import { ProductStatus } from 'src/common/enums/products-enum';
import {
  BulkOperationResultDto,
  BulkProductDto,
} from './dto/bulk-operations.dto';
import { Farmer } from 'src/farmers/entities/farmer.entities';
import { Retailer } from 'src/retailers/entities/retailer.entities';
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

    @InjectRepository(Farmer)
    private farmersRepository: Repository<Farmer>,

    @InjectRepository(Retailer)
    private retailersRepository: Repository<Retailer>,
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

    // Sync seller location before saving
    await this.syncSellerLocation(product);

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

  async findAll(queryDto: ProductQueryDto, tenantSlug?: string) {
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

    // If tenant slug is provided (subdomain), filter by that seller only
    if (tenantSlug) {
      const sellerInfo = await this.resolveSellerBySlug(tenantSlug);
      if (sellerInfo) {
        queryBuilder.andWhere('product.sellerId = :sellerId', {
          sellerId: sellerInfo.id,
        });
      } else {
        // If invalid tenant slug, return empty results
        return { data: [], total: 0 };
      }
    }

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

    // Sync seller location in case it changed
    await this.syncSellerLocation(product);

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
      } catch (error:any) {
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
    } catch (error:any) {
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
    } catch (error:any) {
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

  /**
   * Search products by location with PostGIS spatial queries
   */
  async searchByLocation(
    searchDto: SearchProductsDto,
  ): Promise<ProductSearchResponseDto> {
    const {
      latitude,
      longitude,
      radiusKm = 50,
      query,
      category,
      certifications,
      condition,
      origin,
      sellerType,
      minPrice,
      maxPrice,
      deliveryAvailable,
      pickupOnly,
      minRating,
      sortBy = SearchSortBy.DISTANCE,
      page = 1,
      limit = 20,
    } = searchDto;

    const radiusMeters = radiusKm * 1000;
    const skip = (page - 1) * limit;

    // Build the query
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.seller', 'seller')
      .where('product.status = :status', { status: ProductStatus.ACTIVE })
      .andWhere('product.sellerLatitude IS NOT NULL')
      .andWhere('product.sellerLongitude IS NOT NULL')
      .andWhere('product.isAvailable = :isAvailable', { isAvailable: true });

    // Spatial filter - products within radius
    queryBuilder.andWhere(
      `ST_DWithin(
        product.sellerLocation::geography,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
        :radius
      )`,
      { lat: latitude, lng: longitude, radius: radiusMeters },
    );

    // Calculate distance for each product
    queryBuilder.addSelect(
      `ST_Distance(
        product.sellerLocation::geography,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
      ) / 1000`,
      'distance',
    );

    // Text search
    if (query) {
      queryBuilder.andWhere(
        '(product.name ILIKE :query OR product.description ILIKE :query OR product.tags::text ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    // Filters
    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (certifications && certifications.length > 0) {
      queryBuilder.andWhere('product.certifications && :certifications', {
        certifications,
      });
    }

    if (condition) {
      queryBuilder.andWhere('product.condition = :condition', { condition });
    }

    if (origin) {
      queryBuilder.andWhere('product.origin = :origin', { origin });
    }

    if (sellerType) {
      queryBuilder.andWhere('product.sellerType = :sellerType', {
        sellerType,
      });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (pickupOnly) {
      queryBuilder.andWhere('product.pickupOnly = :pickupOnly', {
        pickupOnly: true,
      });
    }

    if (deliveryAvailable) {
      // Check if seller can deliver to user's location
      queryBuilder.andWhere(
        `(product.sellerDeliveryRadiusKm * 1000) >= (ST_Distance(
          product.sellerLocation::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
        ))`,
      );
    }

    if (minRating) {
      queryBuilder.andWhere('product.averageRating >= :minRating', {
        minRating,
      });
    }

    // Sorting
    switch (sortBy) {
      case SearchSortBy.DISTANCE:
        queryBuilder.orderBy('distance', 'ASC');
        break;
      case SearchSortBy.PRICE_LOW_TO_HIGH:
        queryBuilder.orderBy('product.price', 'ASC');
        break;
      case SearchSortBy.PRICE_HIGH_TO_LOW:
        queryBuilder.orderBy('product.price', 'DESC');
        break;
      case SearchSortBy.RATING:
        queryBuilder.orderBy('product.averageRating', 'DESC');
        break;
      case SearchSortBy.NEWEST:
        queryBuilder.orderBy('product.createdAt', 'DESC');
        break;
      case SearchSortBy.POPULAR:
        queryBuilder.orderBy('product.salesCount', 'DESC');
        break;
      default:
        queryBuilder.orderBy('distance', 'ASC');
    }

    // Get total count
    const totalQuery = queryBuilder.clone();
    const total = await totalQuery.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const rawAndEntities = await queryBuilder.getRawAndEntities();

    // Format results
    const results: ProductSearchResultDto[] = await Promise.all(
      rawAndEntities.entities.map(async (product, index) => {
        const distance = parseFloat(rawAndEntities.raw[index].distance);
        const deliveryAvailableToUser =
          (product.sellerDeliveryRadiusKm &&
            distance <= product.sellerDeliveryRadiusKm) ||
          false;

        // Get seller details
        let sellerInfo;
        if (product.sellerType === 'farmer') {
          const farmer = await this.farmersRepository.findOne({
            where: { userId: product.sellerId },
          });
          sellerInfo = {
            id: farmer?.id || product.sellerId,
            name: farmer?.farmName || product.businessName || 'Unknown',
            type: 'farmer' as const,
            location: {
              latitude: product.sellerLatitude,
              longitude: product.sellerLongitude,
              address: product.sellerAddress || farmer?.farmAddress || '',
            },
            deliveryRadiusKm: farmer?.deliveryRadiusKm,
            deliveryDays: farmer?.deliveryDays,
            pickupLocations: farmer?.pickupLocations,
            averageRating: farmer?.averageRating || 0,
            totalReviews: farmer?.totalReviews || 0,
          };
        } else {
          const retailer = await this.retailersRepository.findOne({
            where: { userId: product.sellerId },
          });
          sellerInfo = {
            id: retailer?.id || product.sellerId,
            name: retailer?.businessName || product.businessName || 'Unknown',
            type: 'retailer' as const,
            location: {
              latitude: product.sellerLatitude,
              longitude: product.sellerLongitude,
              address: product.sellerAddress || retailer?.businessAddress || '',
            },
            deliveryRadiusKm: retailer?.deliveryRadiusKm,
            deliveryDays: retailer?.deliveryDays,
            pickupLocations: retailer?.pickupLocations,
            businessType: retailer?.businessType,
            averageRating: retailer?.averageRating || 0,
            totalReviews: retailer?.totalReviews || 0,
          };
        }

        return {
          product,
          distance,
          seller: sellerInfo,
          deliveryAvailable: deliveryAvailableToUser,
          pickupAvailable: !product.pickupOnly || product.pickupOnly,
        };
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      results,
      meta: {
        total,
        page,
        limit,
        totalPages,
        searchRadius: radiusKm,
        userLocation: { latitude, longitude },
      },
    };
  }

  /**
   * Resolve seller ID and type from business slug (subdomain)
   * Used for multi-tenancy subdomain routing
   */
  private async resolveSellerBySlug(
    businessSlug: string,
  ): Promise<{ id: string; type: 'farmer' | 'retailer' } | null> {
    // Try to find farmer with this slug
    const farmer = await this.farmersRepository.findOne({
      where: { businessSlug },
    });

    if (farmer) {
      return { id: farmer.userId, type: 'farmer' };
    }

    // Try to find retailer with this slug
    const retailer = await this.retailersRepository.findOne({
      where: { businessSlug },
    });

    if (retailer) {
      return { id: retailer.userId, type: 'retailer' };
    }

    return null;
  }

  /**
   * Sync seller location to product for efficient spatial queries
   * Called when product is created or updated
   */
  private async syncSellerLocation(product: Product): Promise<void> {
    if (product.sellerType === 'farmer') {
      const farmer = await this.farmersRepository.findOne({
        where: { userId: product.sellerId },
      });

      if (farmer && farmer.latitude && farmer.longitude) {
        product.sellerLatitude = farmer.latitude;
        product.sellerLongitude = farmer.longitude;
        product.sellerAddress = farmer.farmAddress;
        product.sellerDeliveryRadiusKm = farmer.deliveryRadiusKm;

        // Create PostGIS geography point
        product.sellerLocation = `SRID=4326;POINT(${farmer.longitude} ${farmer.latitude})`;
      }
    } else if (product.sellerType === 'retailer') {
      const retailer = await this.retailersRepository.findOne({
        where: { userId: product.sellerId },
      });

      if (retailer && retailer.latitude && retailer.longitude) {
        product.sellerLatitude = retailer.latitude;
        product.sellerLongitude = retailer.longitude;
        product.sellerAddress = retailer.businessAddress;
        product.sellerDeliveryRadiusKm = retailer.deliveryRadiusKm;

        // Create PostGIS geography point
        product.sellerLocation = `SRID=4326;POINT(${retailer.longitude} ${retailer.latitude})`;
      }
    }
  }

  /**
   * Batch sync all product locations from their sellers
   * Useful for migrations or when seller locations change
   */
  async syncAllProductLocations(
    sellerType?: 'farmer' | 'retailer',
  ): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;

    const queryBuilder = this.productsRepository.createQueryBuilder('product');

    if (sellerType) {
      queryBuilder.where('product.sellerType = :sellerType', { sellerType });
    }

    const products = await queryBuilder.getMany();

    for (const product of products) {
      try {
        await this.syncSellerLocation(product);
        await this.productsRepository.save(product);
        updated++;
      } catch (error) {
        console.error(
          `Failed to sync location for product ${product.id}:`,
          error,
        );
        failed++;
      }
    }

    return { updated, failed };
  }
}
