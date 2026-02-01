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

export enum DeliveryProvider {
  UBER_DIRECT = 'uber_direct',
  SELF_DELIVERY = 'self_delivery',
  PICKUP = 'pickup',
}

export enum DeliveryStatus {
  PENDING = 'pending',
  QUOTE_OBTAINED = 'quote_obtained',
  SCHEDULED = 'scheduled',
  PICKUP = 'pickup',
  PICKUP_COMPLETE = 'pickup_complete',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
  RETURNED = 'returned',
  FAILED = 'failed',
}

@Entity('deliveries')
@Index(['orderId'])
@Index(['status'])
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Index()
  orderId?: string;

  @Column()
  @Index()
  customerId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column()
  @Index()
  sellerId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column({
    type: 'enum',
    enum: DeliveryProvider,
    default: DeliveryProvider.UBER_DIRECT,
  })
  provider: DeliveryProvider;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  @Index()
  status: DeliveryStatus;

  @Column({ nullable: true })
  externalDeliveryId?: string;

  @Column({ nullable: true })
  quoteId?: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  deliveryFee?: number;

  @Column({ nullable: true })
  currencyCode?: string;

  @Column({ nullable: true })
  trackingUrl?: string;

  @Column('json')
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };

  @Column('json')
  pickupContact: {
    firstName: string;
    lastName?: string;
    phoneNumber: string;
    email?: string;
    companyName?: string;
  };

  @Column({ type: 'text', nullable: true })
  pickupNotes?: string;

  @Column('json')
  dropoffAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };

  @Column('json')
  dropoffContact: {
    firstName: string;
    lastName?: string;
    phoneNumber: string;
    email?: string;
  };

  @Column({ type: 'text', nullable: true })
  dropoffNotes?: string;

  @Column({ default: false })
  signatureRequired: boolean;

  @Column({ default: false })
  proofOfDeliveryRequired: boolean;

  @Column('json', { nullable: true })
  items?: Array<{
    title: string;
    quantity: number;
    price?: number;
  }>;

  @Column('json', { nullable: true })
  courier?: {
    name?: string;
    phoneNumber?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    imageUrl?: string;
    vehicleType?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  pickupEta?: Date;

  @Column({ type: 'timestamp', nullable: true })
  dropoffEta?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledPickupTime?: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDropoffTime?: Date;

  @Column('json', { nullable: true })
  proofOfDelivery?: {
    signatureUrl?: string;
    signedBy?: string;
    photoUrl?: string;
  };

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
