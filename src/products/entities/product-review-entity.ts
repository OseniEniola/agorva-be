import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from './products-entity';

@Entity('reviews')
@Index(['productId', 'userId'], { unique: true })
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  userId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', width: 1 })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ default: false })
  isVerifiedPurchase: boolean;

  @Column({ default: 0 })
  helpfulCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}