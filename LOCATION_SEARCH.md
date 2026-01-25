# Location-Based Product Search

## Overview

The Agorva Backend implements a sophisticated location-based product search using **PostGIS** spatial queries. This allows users to find products (from both farmers and retailers) near their location with accurate distance calculations.

## Architecture: Option C (Hybrid Approach)

### What is Data Denormalization?

**Data denormalization** means storing the same data in multiple places for performance optimization.

#### Without Denormalization
- Farmer location: Stored ONCE in `farmers` table
- Retailer location: Stored ONCE in `retailers` table
- Products: Reference seller via `sellerId`
- **Search requires**: JOIN to farmers/retailers table every time

#### With Denormalization (Our Approach)
- Farmer/Retailer location: Stored in `farmers`/`retailers` table ← **Source of Truth**
- Products: **ALSO** store seller location ← **Cached Copy**
- **Search requires**: No JOINs, direct spatial query on products table
- **Trade-off**: Must keep data in sync when seller location changes

### Why Hybrid Approach?

**Pros:**
- ⚡ **10-100x faster searches** - No JOINs needed
- 📊 **Spatial indexing** - PostGIS GIST index on products table
- 🚀 **Scales to millions** of products
- 📍 **Accurate distance** calculations using Earth's curvature

**Cons:**
- 🔄 **Sync required** - When farmer/retailer moves, update all their products
- 💾 **Extra storage** - Location duplicated per product
- ⚠️ **Consistency risk** - Must handle sync failures

## Database Schema

### New Fields Added to Products Table

```typescript
{
  // Denormalized from seller (farmer or retailer)
  sellerLatitude: number;        // Decimal(10,8)
  sellerLongitude: number;       // Decimal(11,8)
  sellerLocation: string;        // PostGIS geography(Point, 4326)
  sellerAddress: string;         // Cached address
  sellerDeliveryRadiusKm: number; // Cached delivery radius
}
```

### Spatial Indexes

```sql
-- Regular B-tree indexes for lat/lng
CREATE INDEX IDX_products_sellerLatitude ON products (sellerLatitude);
CREATE INDEX IDX_products_sellerLongitude ON products (sellerLongitude);

-- PostGIS GIST index for spatial queries
CREATE INDEX IDX_products_sellerLocation ON products USING GIST (sellerLocation);
```

## API Endpoint

### POST /products/search/location

**Description:** Search for products near a specific location using PostGIS spatial queries.

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radiusKm": 50,
  "query": "organic tomatoes",
  "category": "VEGETABLES",
  "certifications": ["ORGANIC", "NON_GMO"],
  "sellerType": "farmer",
  "minPrice": 0,
  "maxPrice": 100,
  "deliveryAvailable": true,
  "pickupOnly": false,
  "minRating": 4,
  "sortBy": "distance",
  "page": 1,
  "limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "message": "Found 15 products within 50km",
  "data": {
    "results": [
      {
        "product": {
          "id": "uuid",
          "name": "Organic Tomatoes",
          "price": 4.99,
          "category": "VEGETABLES",
          // ... other product fields
        },
        "distance": 12.5,
        "seller": {
          "id": "uuid",
          "name": "Green Valley Farm",
          "type": "farmer",
          "location": {
            "latitude": 40.7200,
            "longitude": -74.0100,
            "address": "123 Farm Rd, NJ"
          },
          "deliveryRadiusKm": 25,
          "deliveryDays": ["MONDAY", "THURSDAY"],
          "averageRating": 4.8,
          "totalReviews": 45
        },
        "deliveryAvailable": true,
        "pickupAvailable": true
      }
    ],
    "meta": {
      "total": 15,
      "page": 1,
      "limit": 20,
      "totalPages": 1,
      "searchRadius": 50,
      "userLocation": {
        "latitude": 40.7128,
        "longitude": -74.0060
      }
    }
  }
}
```

## How It Works

### 1. Spatial Query (PostGIS)

```sql
-- Find products within radius
WHERE ST_DWithin(
  product.sellerLocation::geography,
  ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
  radius_in_meters
)

-- Calculate distance for each product
ST_Distance(
  product.sellerLocation::geography,
  ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
) / 1000 AS distance  -- Convert meters to km
```

### 2. Location Sync Strategy

#### Automatic Sync on Product Create/Update
```typescript
// In ProductsService.create() and .update()
await this.syncSellerLocation(product);
await this.productsRepository.save(product);
```

#### Manual Sync When Seller Location Changes
```typescript
// In FarmersService or RetailersService
import { ProductLocationSyncService } from 'products/services';

// After updating farmer/retailer location
await this.productLocationSyncService.syncFarmerProducts(userId);
// or
await this.productLocationSyncService.syncRetailerProducts(userId);
```

#### Batch Sync (Migration/Background Job)
```typescript
// Run migration or scheduled task
await productLocationSyncService.syncAllProducts();
// Returns: { farmers: 150, retailers: 75, total: 225 }
```

### 3. Distance Calculation

Uses **Haversine formula** via PostGIS `ST_Distance`:
- Accounts for Earth's spherical shape
- Returns distance in meters (converted to km)
- Accurate up to ~0.5% for distances < 500km

## Usage Examples

### Example 1: Find Organic Vegetables Within 25km
```typescript
const searchDto: SearchProductsDto = {
  latitude: 40.7128,
  longitude: -74.0060,
  radiusKm: 25,
  category: ProductCategory.VEGETABLES,
  certifications: [CertificationType.ORGANIC],
  sortBy: SearchSortBy.DISTANCE,
};

const results = await productsService.searchByLocation(searchDto);
```

### Example 2: Find Products with Delivery Available
```typescript
const searchDto: SearchProductsDto = {
  latitude: 40.7128,
  longitude: -74.0060,
  radiusKm: 50,
  deliveryAvailable: true,  // Only products where seller can deliver
  sortBy: SearchSortBy.DISTANCE,
};
```

### Example 3: Search from Farmers Only
```typescript
const searchDto: SearchProductsDto = {
  latitude: 40.7128,
  longitude: -74.0060,
  radiusKm: 100,
  sellerType: 'farmer',
  minRating: 4.5,
  sortBy: SearchSortBy.RATING,
};
```

## Maintenance

### Run Migration
```bash
npm run migration:run
# or
yarn migration:run
```

### Sync All Product Locations
```typescript
// Via service
const result = await productLocationSyncService.syncAllProducts();
console.log(`Synced ${result.total} products`);
```

### Monitor Sync Status
Check logs for sync operations:
```
[ProductLocationSyncService] Synced 15 products for farmer abc-123
[ProductLocationSyncService] Full sync complete: 150 farmer products, 75 retailer products, 225 total
```

## Performance Considerations

### Optimizations
1. **Spatial Index (GIST)** - Essential for fast radius queries
2. **Limit radius** - Max 500km prevents expensive queries
3. **Pagination** - Default 20 results per page
4. **Lazy loading** - Don't load seller details until needed

### Benchmarks (Estimated)
- 1,000 products: < 50ms
- 10,000 products: < 100ms
- 100,000 products: < 500ms
- 1,000,000 products: < 2s

## Future Enhancements

1. **Caching** - Redis cache for popular locations (city centers)
2. **Async sync** - Queue-based location sync for high-volume updates
3. **Geofencing** - Notify users when new products appear nearby
4. **Heatmaps** - Show product density on maps
5. **Multi-location sellers** - Support farmers with multiple distribution points

## Troubleshooting

### Products not showing in search
1. Check if product has `sellerLatitude` and `sellerLongitude` populated
2. Verify seller (farmer/retailer) has valid location coordinates
3. Run manual sync: `productLocationSyncService.syncFarmerProducts(userId)`

### Inaccurate distances
1. Ensure PostGIS extension is enabled: `CREATE EXTENSION postgis;`
2. Verify SRID is 4326 (WGS 84 - standard GPS coordinates)
3. Check that longitude/latitude are not swapped

### Slow queries
1. Verify spatial index exists: `\d products` in psql
2. Reduce search radius
3. Add more specific filters (category, certifications)
4. Consider adding composite indexes

## Related Files

- **Entity**: `src/products/entities/products-entity.ts`
- **Service**: `src/products/products.service.ts`
- **Sync Service**: `src/products/services/product-location-sync.service.ts`
- **Controller**: `src/products/products.controller.ts`
- **DTOs**:
  - `src/products/dto/search-products.dto.ts`
  - `src/products/dto/search-results.dto.ts`
- **Migration**: `src/database/migrations/1737744000000-AddProductLocationFields.ts`
