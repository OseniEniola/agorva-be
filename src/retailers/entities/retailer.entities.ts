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
import { Exclude } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import { BusinessStatus } from 'src/common/enums/business-enum';
import { DeliveryDay } from 'src/common/enums/delivery-days-enum';
import { RetailerType } from 'src/common/enums/retailer-enum';

@Entity('retailers')
export class Retailer {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.retailers, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Business Information
  @ApiProperty()
  @Column()
  businessName: string;

  @ApiProperty()
  @Column({ unique: true, nullable: true })
  businessSlug: string;

  @ApiProperty({ enum: RetailerType })
  @Column({
    type: 'enum',
    enum: RetailerType,
    default: RetailerType.GROCERY_STORE,
  })
  businessType: RetailerType;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty()
  @Column({ nullable: true })
  website: string;

  // Location Details
  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @ApiProperty()
  @Column()
  businessAddress: string;

  @ApiProperty()
  @Column({ nullable: true })
  city: string;

  @ApiProperty()
  @Column({ nullable: true })
  province: string;

  @ApiProperty()
  @Column({ nullable: true })
  postalCode: string;

  @ApiProperty()
  @Column({ nullable: true })
  country: string;

  // Operating Hours
  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  operatingHours: {
    day: DeliveryDay;
    openTime: string; // HH:mm format
    closeTime: string; // HH:mm format
    isClosed: boolean;
  }[];

  // Business Registration
  @ApiProperty()
  @Column({ nullable: true })
  businessRegistrationNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  taxId: string;

  @ApiProperty()
  @Column({ nullable: true })
  businessLicenseNumber: string;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  businessLicenseExpiry: Date;

  // Banking Information
  @Exclude()
  @Column({ nullable: true })
  bankAccountNumber: string;

  @Exclude()
  @Column({ nullable: true })
  bankRoutingNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  bankAccountHolderName: string;

  @ApiProperty()
  @Column({ nullable: true })
  bankName: string;

  // Delivery & Pickup Settings
  @ApiProperty()
  @Column({ default: false })
  offersDelivery: boolean;

  @ApiProperty()
  @Column({ default: true })
  offersPickup: boolean;

  @ApiProperty()
  @Column({ type: 'int', nullable: true })
  deliveryRadiusKm: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minimumOrderAmount: number;

  @ApiProperty({ enum: DeliveryDay, isArray: true })
  @Column({
    type: 'enum',
    enum: DeliveryDay,
    array: true,
    nullable: true,
  })
  deliveryDays: DeliveryDay[];

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  pickupLocations: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    availableDays: DeliveryDay[];
    hours: string;
    isMainLocation: boolean;
  }[];

  // Product Preferences
  @ApiProperty()
  @Column({ type: 'simple-array', nullable: true })
  preferredProductCategories: string[];

  @ApiProperty()
  @Column({ type: 'simple-array', nullable: true })
  preferredCertifications: string[];

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedMonthlyPurchaseVolume: number;

  // Status and Verification
  @ApiProperty({ enum: BusinessStatus })
  @Column({
    type: 'enum',
    enum: BusinessStatus,
    default: BusinessStatus.PENDING,
  })
  status: BusinessStatus;

  @ApiProperty()
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  verificationNotes: string;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  verifiedBy: string; // Admin user ID

  // Documents
  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  businessDocuments: {
    documentType: string; // 'license', 'permit', 'insurance', etc.
    documentName: string;
    documentUrl: string;
    uploadedAt: Date;
    expiryDate?: Date;
  }[];

  // Media
  @ApiProperty()
  @Column({ nullable: true })
  logo: string;

  @ApiProperty()
  @Column({ type: 'simple-array', nullable: true })
  storeImages: string[];

  // Ratings and Reviews
  @ApiProperty()
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  totalOrders: number;

  // Contact Information
  @ApiProperty()
  @Column({ nullable: true })
  contactPersonName: string;

  @ApiProperty()
  @Column({ nullable: true })
  contactPersonTitle: string;

  @ApiProperty()
  @Column({ nullable: true })
  businessPhone: string;

  @ApiProperty()
  @Column({ nullable: true })
  businessEmail: string;

  // Additional Settings
  @ApiProperty()
  @Column({ default: true })
  acceptsNewOrders: boolean;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  specialRequirements: string;

  @ApiProperty()
  @Column({ type: 'simple-array', nullable: true })
  paymentMethods: string[]; // ['credit_card', 'cash', 'invoice', 'bank_transfer']

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
