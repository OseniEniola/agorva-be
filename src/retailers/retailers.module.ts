import { Module } from '@nestjs/common';
import { RetailersService } from './retailers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Retailer } from './entities/retailer.entities';
import { RetailerController } from './retailers.controller';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Retailer, User])],
  providers: [RetailersService],
  controllers: [RetailerController],
  exports: [RetailersService]
})
export class RetailersModule {}
