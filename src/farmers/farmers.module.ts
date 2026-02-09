import { Module } from '@nestjs/common';
import { FarmersController } from './farmers.controller';
import { FarmersService } from './farmers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Farmer } from './entities/farmer.entities';
import { User } from 'src/users/entities/user.entity';
import { Retailer } from 'src/retailers/entities/retailer.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Farmer, User, Retailer])],
  controllers: [FarmersController],
  providers: [FarmersService],
  exports: [FarmersService],
})
export class FarmersModule {}
