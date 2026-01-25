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
import { Retailer } from './retailer.entities';
import { StaffRole, StaffStatus } from 'src/common/enums/retailer-enum';

@Entity('retailer_staff')
export class RetailerStaff {
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
  @Column()
  firstName: string;

  @ApiProperty()
  @Column()
  lastName: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column()
  phoneNo: string;

  @ApiProperty({ enum: StaffRole })
  @Column({
    type: 'enum',
    enum: StaffRole,
    default: StaffRole.STAFF,
  })
  role: StaffRole;

  @ApiProperty({ enum: StaffStatus })
  @Column({
    type: 'enum',
    enum: StaffStatus,
    default: StaffStatus.ACTIVE,
  })
  status: StaffStatus;

  @ApiProperty()
  @Column({ type: 'simple-array', nullable: true })
  permissions: string[]; // ['view_orders', 'create_orders', 'manage_inventory', etc.]

  @Exclude()
  @Column({ nullable: true })
  invitationToken: string;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  invitedAt: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  joinedAt: Date;

  @ApiProperty()
  @Column({ nullable: true })
  invitedBy: string; // Staff ID who sent the invitation

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  lastActiveAt: Date;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
