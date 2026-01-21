import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './products-entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ nullable: true })
  altText?: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: false })
  isPrimary: boolean;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;
}