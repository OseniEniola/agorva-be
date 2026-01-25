import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Retailer } from './retailer.entities';
import { User } from 'src/users/entities/user.entity';

@Entity('retailer_reviews')
export class RetailerReview {
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
  reviewerId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @ApiProperty()
  @Column({ type: 'int' })
  rating: number; // 1-5 stars

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  comment: string;

  @ApiProperty()
  @Column({ nullable: true })
  orderId: string; // Reference to order if review is based on a transaction

  // Detailed ratings
  @ApiProperty()
  @Column({ type: 'int', nullable: true })
  communicationRating: number;

  @ApiProperty()
  @Column({ type: 'int', nullable: true })
  paymentTimelinessRating: number;

  @ApiProperty()
  @Column({ type: 'int', nullable: true })
  professionalismRating: number;

  @ApiProperty()
  @Column({ default: true })
  isVisible: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  responseFromRetailer: string;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  respondedAt: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
