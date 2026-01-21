import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Retailer } from './entities/retailer.entities';
import { User } from 'src/users/entities/user.entity';
import { CreateRetailerDto } from './dto/create-retailer-dto';
import { UpdateRetailerDto } from './dto/update-retailer-dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RetailersService {
  constructor(
    @InjectRepository(Retailer)
    private retailerRepo: Repository<Retailer>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createRetailer(
    userId: string,
    dto: CreateRetailerDto,
  ): Promise<Retailer> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    const retailer = this.retailerRepo.create({ ...dto, user });
    return await this.retailerRepo.save(retailer);
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
