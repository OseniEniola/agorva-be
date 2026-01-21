import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import { 
  ProductCategory, 
  ProductStatus, 
  UnitType, 
  CertificationType,
  ProductCondition,
  StorageType,
  ShippingMethod,
 ProductOrigin } from 'src/common/enums/products-enum';
import { ProductImage } from './product-image-entity';
import { Review } from './product-review-entity';


@Entity('products')
@Index(['category', 'status'])
@Index(['sellerId', 'status'])
@Index(['sellerType', 'status'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  shortDescription?: string;

  @Column({
    type: 'enum',
    enum: ProductCategory,
    default: ProductCategory.OTHER
  })
  category: ProductCategory;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT
  })
  status: ProductStatus;

  // Pricing
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  compareAtPrice?: number; // Original price for showing discounts

  // Inventory
  @Column({ default: 0 })
  quantity: number;

  @Column({
    type: 'enum',
    enum: UnitType,
    default: UnitType.KG
  })
  unit: UnitType;

  @Column({ default: 0 })
  minOrderQuantity: number;

  @Column({ nullable: true })
  maxOrderQuantity?: number;

  // Product Details
  @Column({ nullable: true })
  sku?: string; // Stock Keeping Unit

  @Column({ nullable: true })
  barcode?: string;

  @Column('simple-array', { nullable: true })
  tags?: string[]; // e.g., ['seasonal', 'fresh', 'local']

  // Certifications
  @Column({
    type: 'enum',
    enum: CertificationType,
    array: true,
    default: []
  })
  certifications: CertificationType[];

  // Product Condition
  @Column({
    type: 'enum',
    enum: ProductCondition,
    default: ProductCondition.FRESH
  })
  condition: ProductCondition;

  @Column({ type: 'text', nullable: true })
  conditionNotes?: string; // e.g., "Minor bruising on skin, perfectly edible"

  // Seller Information (Farmer or Retailer)
  @Column()
  @Index()
  sellerId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column({
    type: 'enum',
    enum: ['farmer', 'retailer'],
  })
  sellerType: 'farmer' | 'retailer';

  @Column({ nullable: true })
  businessName?: string; // Farm name or retail business name (cached for performance)

  // Location
  @Column({ nullable: true })
  originLocation?: string; // Where the product is grown/produced

  @Column({
    type: 'enum',
    enum: ProductOrigin,
    default: ProductOrigin.LOCAL
  })
  origin: ProductOrigin;

  @Column({ nullable: true })
  distanceFromBuyer?: number; // In miles/km

  // Availability
  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'timestamp', nullable: true })
  availableFrom?: Date;

  @Column({ type: 'timestamp', nullable: true })
  availableUntil?: Date;

  @Column({ type: 'date', nullable: true })
  harvestDate?: Date; // When was it harvested

  @Column({ type: 'date', nullable: true })
  expiryDate?: Date; // Best before date

  // Storage & Shipping
  @Column({
    type: 'enum',
    enum: StorageType,
    default: StorageType.AMBIENT
  })
  storageType: StorageType;

  @Column({ default: false })
  requiresRefrigeration: boolean;

  @Column({
    type: 'enum',
    enum: ShippingMethod,
    default: ShippingMethod.STANDARD
  })
  shippingMethod: ShippingMethod;

  @Column({ default: true })
  isShippable: boolean;

  @Column({ default: false })
  pickupOnly: boolean;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  weight?: number; // For shipping calculations

  @Column({ default: false })
  isFragile: boolean;

  @Column({ default: false })
  isPerishable: boolean;

  // Images
  @OneToMany(() => ProductImage, (image) => image.product, { 
    cascade: true,
    eager: true 
  })
  images: ProductImage[];

  // Reviews
  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  reviewCount: number;

  // SEO
  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  metaTitle?: string;

  @Column({ type: 'text', nullable: true })
  metaDescription?: string;

  // Statistics
  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  salesCount: number;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  // Soft delete
  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  deletedAt?: Date;
}