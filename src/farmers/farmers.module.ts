import { Module } from '@nestjs/common';
import { FarmersController } from './farmers.controller';
import { FarmersService } from './farmers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Farmer } from './entities/farmer.entities';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Farmer, User])],
  controllers: [FarmersController],
  providers: [FarmersService],

})
export class FarmersModule {}
