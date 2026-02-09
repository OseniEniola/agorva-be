# Multi-Tenancy Subdomain Setup Guide

This document explains the multi-tenancy subdomain feature implemented in the Agorva backend API.

## Overview

The platform now supports multi-tenancy through subdomain routing:
- **Main domain** (e.g., `agorva.com` or `api.agorva.com`) - Shows ALL products from all farmers and retailers
- **Subdomain** (e.g., `john-farm.agorva.com`) - Shows ONLY products from that specific farmer/retailer

## Architecture

### 1. **Business Slug**
Each farmer and retailer has a unique `businessSlug` field that serves as their subdomain identifier.

**Examples:**
- Farmer "Green Valley Farm" → slug: `green-valley-farm`
- Retailer "Fresh Mart" → slug: `fresh-mart`

### 2. **Tenant Middleware**
The `TenantMiddleware` extracts the subdomain from the incoming request:
- **Main domain**: `agorva.com` → `subdomain = null`
- **Subdomain**: `john-farm.agorva.com` → `subdomain = "john-farm"`
- **Localhost dev**: `john-farm.localhost:3000` → `subdomain = "john-farm"`

### 3. **Product Filtering**
The `ProductsService.findAll()` method accepts a `tenantSlug` parameter:
- If `tenantSlug` is provided → filters products by that seller only
- If `tenantSlug` is `null` → shows all products (main domain behavior)

## Database Changes

### Migration
Run the migration to add the `businessSlug` column:

```bash
npm run migration:run
```

The migration adds:
- `businessSlug` column to both `farmers` and `retailers` tables
- Unique constraint on `businessSlug`
- Indexes for fast lookup

### Generate Slugs for Existing Data

If you have existing farmers/retailers without slugs, run:

```bash
ts-node src/common/scripts/generate-slugs.ts
```

This will auto-generate unique slugs for all existing records.

## API Usage

### Creating a Farmer/Retailer with Custom Slug

**POST** `/farmers/profile`
```json
{
  "farmName": "Green Valley Farm",
  "businessSlug": "green-valley-farm",
  "description": "Organic vegetables and fruits",
  ...
}
```

**Validations:**
- Slug must be 3-63 characters
- Only lowercase letters, numbers, and hyphens
- Cannot start or end with a hyphen
- Must be unique across all farmers AND retailers

### Auto-Generated Slugs

If you don't provide a `businessSlug`, it will be auto-generated from the farm/business name:

**POST** `/farmers/profile`
```json
{
  "farmName": "Green Valley Farm",
  ...
}
```
→ Auto-generates: `businessSlug: "green-valley-farm"`

If a collision occurs, it appends a number: `green-valley-farm-1`, `green-valley-farm-2`, etc.

### Fetching Products

#### Main Domain (All Products)
**GET** `https://agorva.com/products`
- Returns all products from all sellers
- No filtering by subdomain

#### Subdomain (Specific Seller)
**GET** `https://john-farm.agorva.com/products`
- Returns only products from the seller with `businessSlug = "john-farm"`
- If slug doesn't exist, returns empty array

## Frontend Implementation

### DNS Configuration

For production, set up wildcard DNS:

```
*.agorva.com → CNAME → your-server.com
```

This allows any subdomain (`xyz.agorva.com`) to route to your backend.

### Subdomain Detection

Your frontend can detect the subdomain and adjust the UI:

```javascript
const hostname = window.location.hostname; // e.g., "john-farm.agorva.com"
const parts = hostname.split('.');

let subdomain = null;
if (parts.length > 2) {
  subdomain = parts[0]; // "john-farm"
}

if (subdomain) {
  // Show seller-specific branding
  // Fetch only that seller's products
} else {
  // Show main marketplace
  // Fetch all products
}
```

### API Calls

The backend automatically handles subdomain filtering, so you don't need to change your API calls:

```javascript
// Same API call works for both:
// - agorva.com/products → all products
// - john-farm.agorva.com/products → john's products only

fetch('https://' + window.location.hostname + '/products')
  .then(res => res.json())
  .then(products => {
    // Products are already filtered by subdomain
  });
```

## Development Setup

### Local Testing with Subdomains

#### Option 1: Edit `/etc/hosts` (Mac/Linux)
```
127.0.0.1 john-farm.localhost
127.0.0.1 jane-store.localhost
127.0.0.1 agorva.localhost
```

Then access:
- `http://agorva.localhost:3000` → main domain
- `http://john-farm.localhost:3000` → john's subdomain

#### Option 2: Use `.localhost` domains directly
Most modern browsers support `.localhost` subdomains without configuration:
- `http://john-farm.localhost:3000`
- `http://jane-store.localhost:3000`

### Testing with cURL

```bash
# Test main domain (all products)
curl http://localhost:3000/products

# Test subdomain (specific seller's products)
curl -H "Host: john-farm.localhost" http://localhost:3000/products
```

## Code Structure

### Key Files

1. **Middleware**
   - `src/common/middleware/tenant.middleware.ts` - Extracts subdomain from request

2. **Decorator**
   - `src/common/decorators/tenant.decorator.ts` - Injects tenant info into controllers

3. **Utilities**
   - `src/common/utils/slug.util.ts` - Slug generation and validation

4. **Entities**
   - `src/farmers/entities/farmer.entities.ts` - Added `businessSlug` field
   - `src/retailers/entities/retailer.entities.ts` - Added `businessSlug` field

5. **Services**
   - `src/farmers/farmers.service.ts` - Slug generation in `createProfile()`
   - `src/retailers/retailers.service.ts` - Slug generation in `createRetailer()`
   - `src/products/products.service.ts` - Tenant filtering in `findAll()`

6. **Controllers**
   - `src/products/products.controller.ts` - Uses `@Tenant()` decorator

7. **DTOs**
   - `src/farmers/dto/create-farmer-profile.dto.ts` - Added `businessSlug` field
   - `src/retailers/dto/create-retailer-dto.ts` - Added `businessSlug` field

## Security Considerations

### Slug Validation
- Slugs are validated server-side to prevent injection attacks
- Only alphanumeric characters and hyphens allowed
- Length limited to 63 characters (DNS subdomain limit)

### Cross-Tenant Access Prevention
- Products are automatically filtered by subdomain
- No way to access another seller's products via subdomain manipulation

### Reserved Subdomains
Consider reserving certain subdomains for system use:
- `www`, `api`, `admin`, `app`, `mail`, `ftp`, `cdn`, etc.

You can add validation in the slug creation:

```typescript
const RESERVED_SLUGS = ['www', 'api', 'admin', 'app', 'mail', 'cdn', 'static'];

if (RESERVED_SLUGS.includes(businessSlug)) {
  throw new BadRequestException('This slug is reserved. Please choose another.');
}
```

## Advanced Features

### Custom Domains (Future Enhancement)

You can extend this to support custom domains:

1. Add `customDomain` field to Farmer/Retailer entities
2. Update middleware to check custom domains
3. Require domain verification (DNS TXT record)
4. Update SSL certificate to include custom domains

**Example:**
- Farmer sets `customDomain: "freshfarm.com"`
- Users can access via `freshfarm.com` OR `john-farm.agorva.com`

### Multi-Seller Filtering

If you want to allow filtering by multiple sellers:

```typescript
// Example: ?sellers=john-farm,jane-store
const sellerSlugs = query.sellers?.split(',');
// Filter products where seller slug is in array
```

## Troubleshooting

### Issue: Subdomain not detected
**Solution:** Check that:
1. `TenantMiddleware` is registered in `AppModule`
2. Request has correct `Host` header
3. CORS is configured to accept subdomain requests

### Issue: Slug already taken
**Solution:**
- Choose a different slug
- Or let the system auto-generate with a number suffix

### Issue: Products not filtering correctly
**Solution:**
1. Verify `businessSlug` exists in database
2. Check tenant middleware is extracting subdomain correctly
3. Ensure `resolveSellerBySlug()` is finding the seller

### Issue: CORS errors on subdomain
**Solution:** Update CORS config in `main.ts`:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    /\.agorva\.com$/,  // Allow all agorva.com subdomains
  ],
  credentials: true,
});
```

## Testing

### Unit Tests

```typescript
describe('TenantMiddleware', () => {
  it('should extract subdomain from hostname', () => {
    // Test cases for main domain and subdomains
  });
});

describe('SlugUtil', () => {
  it('should generate valid slugs', () => {
    expect(SlugUtil.generateSlug('Green Valley Farm')).toBe('green-valley-farm');
  });

  it('should validate slug format', () => {
    expect(SlugUtil.validateSlug('valid-slug')).toBe(true);
    expect(SlugUtil.validateSlug('Invalid Slug!')).toBe(false);
  });
});
```

### Integration Tests

```typescript
describe('Products API with Subdomains', () => {
  it('should return all products on main domain', async () => {
    const response = await request(app)
      .get('/products')
      .set('Host', 'agorva.com');

    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should return only seller products on subdomain', async () => {
    const response = await request(app)
      .get('/products')
      .set('Host', 'john-farm.agorva.com');

    // All products should belong to john-farm
    response.body.data.forEach(product => {
      expect(product.seller.businessSlug).toBe('john-farm');
    });
  });
});
```

## Summary

The multi-tenancy feature provides:
- ✅ Unique subdomain for each farmer/retailer
- ✅ Automatic product filtering based on subdomain
- ✅ SEO-friendly URLs
- ✅ Scalable architecture for thousands of sellers
- ✅ Easy frontend integration
- ✅ Secure slug validation

For questions or issues, please refer to the codebase or create an issue in the repository.
