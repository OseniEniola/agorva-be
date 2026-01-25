import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Retailer } from './retailer.entities';
import { Farmer } from 'src/farmers/entities/farmer.entities';

@Entity('retailer_favorites')
@Index(['retailerId', 'farmerId'], { unique: true })
export class RetailerFavorite {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  retailerId: string;

  @ManyToOne(() => Retailer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'retailerId' })
  retailer: Retailer;

  @ApiProperty()
  @Column('uuid')
  farmerId: string;

  @ManyToOne(() => Farmer, { eager: true })
  @JoinColumn({ name: 'farmerId' })
  farmer: Farmer;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
