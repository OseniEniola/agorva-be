import { BusinessStatus } from 'src/common/enums/business-enum';
import { DeliveryDay } from 'src/common/enums/delivery-days-enum';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('retailers')
export class Retailer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'uuid', default: () => 'uuid_generate_v4()' })
  businessId: string;

  @Column()
  businessName: string;

  @Column()
  businessAddress: string;

  @Column({
    type: 'enum',
    enum: BusinessStatus,
    default: BusinessStatus.PENDING,
  })
  businessStatus: string;

  @Column()
  pickupLocation: string;

  @Column({
    type: 'enum',
    enum: DeliveryDay,
    array: true,
    default: [],
  })
  businessDeliveryDays: DeliveryDay[];

  @ManyToOne(() => User, (user) => user.retailers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
