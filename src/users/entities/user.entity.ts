import { Exclude } from 'class-transformer';
import { UserRole, UserStatus } from 'src/common/enums/user-role.enum';
import { Farmer } from 'src/farmers/entities/farmer.entities';
import { Retailer } from 'src/retailers/entities/retailer.entities';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() //Exclude password from responses
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CONSUMER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phoneNo: string;

  @Column()
  address: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326, // WGS 84 (standard GPS coordinates)
    nullable: true,
  })
  location: string; // GeoJSON format or WKT (Well-Known Text)

  @Column({ nullable: true })
  @Exclude()
  refreshToken?: string;

  @Column({ nullable: true })
  @Exclude()
  emailVerificationToken?: string;

  @Column({ nullable: true })
  @Exclude()
  passwordResetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires?: Date;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true })
  @Exclude()
  twoFactorSecret?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  // Lowercase email before insert/update
  @BeforeInsert()
  @BeforeUpdate()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }

  @OneToMany(() => Retailer, (retailer) => retailer.user)
  retailers: Retailer[];

   @OneToMany(() => Farmer, (farmer) => farmer.user)
  farmers: Farmer[];
}
