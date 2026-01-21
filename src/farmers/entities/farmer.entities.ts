// entities/farmer.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { User } from 'src/users/entities/user.entity';
import { FarmerStatus, FarmingMethod } from 'src/common/enums/business-enum';
import { CertificationType } from 'src/common/enums/products-enum';
import { DeliveryDay } from 'src/common/enums/delivery-days-enum';
import { Product } from 'src/products/entities/products-entity';


@Entity('farmers')
export class Farmer {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column('uuid')
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty()
  @Column()
  farmName: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  description: string;

  // Location
  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @ApiProperty()
  @Column({ nullable: true })
  farmAddress: string;

  @ApiProperty()
  @Column({ nullable: true })
  city: string;

  @ApiProperty()
  @Column({ nullable: true })
  province: string;

  @ApiProperty()
  @Column({ nullable: true })
  postalCode: string;

  // Farm details
  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  farmSizeAcres: number;

  @ApiProperty({ enum: FarmingMethod, isArray: true })
  @Column({
    type: 'enum',
    enum: FarmingMethod,
    array: true,
    nullable: true,
  })
  farmingMethods: FarmingMethod[];

  @ApiProperty({ enum: CertificationType, isArray: true })
  @Column({
    type: 'enum',
    enum: CertificationType,
    array: true,
    nullable: true,
  })
  certifications: CertificationType[];

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  certificationDocuments: {
    certificationType: CertificationType;
    documentName: string;
    documentUrl: string;
    issueDate: Date;
    expiryDate?: Date;
    uploadedAt: Date;
  }[];

  // Business details
  @ApiProperty()
  @Column({ nullable: true })
  businessRegistrationNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  taxId: string;

  @Exclude()
  @Column({ nullable: true })
  bankAccountNumber: string;

  @Exclude()
  @Column({ nullable: true })
  bankRoutingNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  bankAccountHolderName: string;

  // Delivery settings
  @ApiProperty()
  @Column({ type: 'int', default: 25 })
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
  }[];

  // Status and verification
  @ApiProperty({ enum: FarmerStatus })
  @Column({
    type: 'enum',
    enum: FarmerStatus,
    default: FarmerStatus.PENDING,
  })
  status: FarmerStatus;

  @ApiProperty()
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  verificationNotes: string;

  @ApiProperty()
  @Column({ nullable: true })
  verifiedAt: Date;

  // Media
  @ApiProperty()
  @Column({ nullable: true })
  profileImage: string;

  @ApiProperty()
  @Column({ type: 'simple-array', nullable: true })
  farmImages: string[];

  // Ratings and reviews
  @ApiProperty()
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  // Relations
  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}