import { ApiProperty } from '@nestjs/swagger';
import { DeliveryProvider, DeliveryStatus } from '../entities/delivery.entity';

export class DeliveryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  orderId?: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  sellerId: string;

  @ApiProperty({ enum: DeliveryProvider })
  provider: DeliveryProvider;

  @ApiProperty({ enum: DeliveryStatus })
  status: DeliveryStatus;

  @ApiProperty({ required: false })
  externalDeliveryId?: string;

  @ApiProperty({ required: false })
  deliveryFee?: number;

  @ApiProperty({ required: false })
  currencyCode?: string;

  @ApiProperty({ required: false })
  trackingUrl?: string;

  @ApiProperty()
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };

  @ApiProperty()
  pickupContact: {
    firstName: string;
    lastName?: string;
    phoneNumber: string;
    email?: string;
    companyName?: string;
  };

  @ApiProperty({ required: false })
  pickupNotes?: string;

  @ApiProperty()
  dropoffAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };

  @ApiProperty()
  dropoffContact: {
    firstName: string;
    lastName?: string;
    phoneNumber: string;
    email?: string;
  };

  @ApiProperty({ required: false })
  dropoffNotes?: string;

  @ApiProperty({ required: false })
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

  @ApiProperty({ required: false })
  pickupEta?: Date;

  @ApiProperty({ required: false })
  dropoffEta?: Date;

  @ApiProperty({ required: false })
  deliveredAt?: Date;

  @ApiProperty({ required: false })
  proofOfDelivery?: {
    signatureUrl?: string;
    signedBy?: string;
    photoUrl?: string;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
