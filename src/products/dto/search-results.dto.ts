import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../entities/products-entity';
import { DeliveryDay } from 'src/common/enums/delivery-days-enum';
import { RetailerType } from 'src/common/enums/retailer-enum';

export class SellerLocationDto {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  address: string;
}

export class PickupLocationDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty({ enum: DeliveryDay, isArray: true })
  availableDays: DeliveryDay[];

  @ApiProperty()
  hours: string;
}

export class SellerInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['farmer', 'retailer'] })
  type: 'farmer' | 'retailer';

  @ApiProperty()
  location: SellerLocationDto;

  @ApiProperty()
  deliveryRadiusKm?: number;

  @ApiProperty({ enum: DeliveryDay, isArray: true })
  deliveryDays?: DeliveryDay[];

  @ApiProperty({ type: [PickupLocationDto] })
  pickupLocations?: PickupLocationDto[];

  @ApiProperty({ enum: RetailerType })
  businessType?: RetailerType;

  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  totalReviews: number;
}

export class ProductSearchResultDto {
  @ApiProperty()
  product: Product;

  @ApiProperty({
    description: 'Distance from user location in kilometers',
  })
  distance: number;

  @ApiProperty()
  seller: SellerInfoDto;

  @ApiProperty({
    description: 'Whether delivery is available to user location',
  })
  deliveryAvailable: boolean;

  @ApiProperty({
    description: 'Whether pickup is available',
  })
  pickupAvailable: boolean;
}

export class SearchResultsMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  searchRadius: number;

  @ApiProperty()
  userLocation: {
    latitude: number;
    longitude: number;
  };
}

export class ProductSearchResponseDto {
  @ApiProperty({ type: [ProductSearchResultDto] })
  results: ProductSearchResultDto[];

  @ApiProperty()
  meta: SearchResultsMetaDto;
}
