import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { UberDirectService } from './uber-direct.service';
import { Delivery } from './entities/delivery.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery]), ConfigModule],
  controllers: [DeliveryController],
  providers: [DeliveryService, UberDirectService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
