import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/products-entity';
import { Farmer } from 'src/farmers/entities/farmer.entities';
import { Retailer } from 'src/retailers/entities/retailer.entities';

@Injectable()
export class ProductLocationSyncService {
  private readonly logger = new Logger(ProductLocationSyncService.name);

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,

    @InjectRepository(Farmer)
    private farmersRepository: Repository<Farmer>,

    @InjectRepository(Retailer)
    private retailersRepository: Repository<Retailer>,
  ) {}

  /**
   * Sync all products for a specific farmer when their location changes
   */
  async syncFarmerProducts(userId: string): Promise<number> {
    try {
      const farmer = await this.farmersRepository.findOne({
        where: { userId },
      });

      if (!farmer || !farmer.latitude || !farmer.longitude) {
        this.logger.warn(`Farmer ${userId} not found or missing location`);
        return 0;
      }

      const result = await this.productsRepository
        .createQueryBuilder()
        .update(Product)
        .set({
          sellerLatitude: farmer.latitude,
          sellerLongitude: farmer.longitude,
          sellerAddress: farmer.farmAddress,
          sellerDeliveryRadiusKm: farmer.deliveryRadiusKm,
          sellerLocation: `SRID=4326;POINT(${farmer.longitude} ${farmer.latitude})`,
        })
        .where('sellerId = :userId', { userId })
        .andWhere('sellerType = :sellerType', { sellerType: 'farmer' })
        .execute();

      this.logger.log(
        `Synced ${result.affected || 0} products for farmer ${userId}`,
      );
      return result.affected || 0;
    } catch (error) {
      this.logger.error(
        `Error syncing products for farmer ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Sync all products for a specific retailer when their location changes
   */
  async syncRetailerProducts(userId: string): Promise<number> {
    try {
      const retailer = await this.retailersRepository.findOne({
        where: { userId },
      });

      if (!retailer || !retailer.latitude || !retailer.longitude) {
        this.logger.warn(`Retailer ${userId} not found or missing location`);
        return 0;
      }

      const result = await this.productsRepository
        .createQueryBuilder()
        .update(Product)
        .set({
          sellerLatitude: retailer.latitude,
          sellerLongitude: retailer.longitude,
          sellerAddress: retailer.businessAddress,
          sellerDeliveryRadiusKm: retailer.deliveryRadiusKm,
          sellerLocation: `SRID=4326;POINT(${retailer.longitude} ${retailer.latitude})`,
        })
        .where('sellerId = :userId', { userId })
        .andWhere('sellerType = :sellerType', { sellerType: 'retailer' })
        .execute();

      this.logger.log(
        `Synced ${result.affected || 0} products for retailer ${userId}`,
      );
      return result.affected || 0;
    } catch (error) {
      this.logger.error(
        `Error syncing products for retailer ${userId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Sync all products in the system (useful for migrations or batch jobs)
   */
  async syncAllProducts(): Promise<{
    farmers: number;
    retailers: number;
    total: number;
  }> {
    this.logger.log('Starting full product location sync...');

    let farmersUpdated = 0;
    let retailersUpdated = 0;

    // Sync all farmer products
    const farmers = await this.farmersRepository.find();
    for (const farmer of farmers) {
      if (farmer.userId) {
        const count = await this.syncFarmerProducts(farmer.userId);
        farmersUpdated += count;
      }
    }

    // Sync all retailer products
    const retailers = await this.retailersRepository.find();
    for (const retailer of retailers) {
      if (retailer.userId) {
        const count = await this.syncRetailerProducts(retailer.userId);
        retailersUpdated += count;
      }
    }

    const total = farmersUpdated + retailersUpdated;
    this.logger.log(
      `Full sync complete: ${farmersUpdated} farmer products, ${retailersUpdated} retailer products, ${total} total`,
    );

    return {
      farmers: farmersUpdated,
      retailers: retailersUpdated,
      total,
    };
  }
}
