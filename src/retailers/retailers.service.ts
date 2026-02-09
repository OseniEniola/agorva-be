import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Retailer } from './entities/retailer.entities';
import { User } from 'src/users/entities/user.entity';
import { CreateRetailerDto } from './dto/create-retailer-dto';
import { UpdateRetailerDto } from './dto/update-retailer-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SlugUtil } from 'src/common/utils/slug.util';
import { Farmer } from 'src/farmers/entities/farmer.entities';

@Injectable()
export class RetailersService {
  constructor(
    @InjectRepository(Retailer)
    private retailerRepo: Repository<Retailer>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Farmer)
    private farmerRepo: Repository<Farmer>,
  ) {}

  async createRetailer(
    userId: string,
    dto: CreateRetailerDto,
  ): Promise<Retailer> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    // Handle businessSlug
    let businessSlug = dto.businessSlug;

    if (businessSlug) {
      // Validate slug format
      if (!SlugUtil.validateSlug(businessSlug)) {
        throw new BadRequestException(
          'Invalid business slug. Use only lowercase letters, numbers, and hyphens (3-63 characters).',
        );
      }

      // Check if slug is already taken
      const slugTaken = await this.isSlugTaken(businessSlug);
      if (slugTaken) {
        throw new ConflictException(
          'This business slug is already taken. Please choose another one.',
        );
      }
    } else {
      // Auto-generate slug from business name
      const baseSlug = SlugUtil.generateSlug(dto.businessName);
      businessSlug = await this.generateUniqueSlug(baseSlug);
    }

    const retailer = this.retailerRepo.create({
      ...dto,
      user,
      businessSlug,
    });
    return await this.retailerRepo.save(retailer);
  }

  // Check if a business slug is already taken by any farmer or retailer
  private async isSlugTaken(slug: string): Promise<boolean> {
    const [farmer, retailer] = await Promise.all([
      this.farmerRepo.findOne({ where: { businessSlug: slug } }),
      this.retailerRepo.findOne({ where: { businessSlug: slug } }),
    ]);

    return !!(farmer || retailer);
  }

  // Generate a unique slug by appending numbers if needed
  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.isSlugTaken(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async getRetailerByUserId(userId: string): Promise<Retailer | null> {
    return this.retailerRepo.findOne({
      where: { user: { id: userId } },
      relations: ['products'],
    });
  }

   async updateRetailerProfile(userId: string, dto: UpdateRetailerDto): Promise<Retailer> {
    const retailer = await this.retailerRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!retailer) {
      throw new NotFoundException('Retailer profile not found');
    }

    Object.assign(retailer, dto);
    return this.retailerRepo.save(retailer);
  }
}
