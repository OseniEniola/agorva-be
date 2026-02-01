# Quick Start Guide: Uber Direct Delivery

Get up and running with Uber Direct delivery in 5 minutes.

## Prerequisites

- Active Uber Direct account
- Customer ID and Customer Secret from Uber Direct dashboard
- PostgreSQL database running
- Node.js and pnpm installed

## Step 1: Configure Environment Variables

Add your Uber Direct credentials to `.env.development`:

```bash
# Uber Direct Delivery
UBER_DIRECT_CUSTOMER_ID=your_customer_id_here
UBER_DIRECT_CUSTOMER_SECRET=your_customer_secret_here
UBER_DIRECT_BASE_URL=https://api.uber.com/v1/customers

# For sandbox testing, use:
# UBER_DIRECT_BASE_URL=https://sandbox-api.uber.com/v1/customers
```

## Step 2: Run Database Migration

```bash
pnpm run migration:run
```

This creates the `deliveries` table in your database.

## Step 3: Start Your Application

```bash
pnpm run start:dev
```

## Step 4: Test the Integration

### Get a Delivery Quote

```bash
curl -X POST http://localhost:3001/delivery/quote \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupAddress": "123 Farm Road, Los Angeles, CA 90210",
    "dropoffAddress": "456 Customer St, Los Angeles, CA 90001",
    "pickupLatitude": 34.0522,
    "pickupLongitude": -118.2437,
    "dropoffLatitude": 34.0407,
    "dropoffLongitude": -118.2468
  }'
```

**Expected Response:**
```json
{
  "quoteId": "quote-abc123",
  "fee": 12.50,
  "currencyCode": "USD",
  "pickupEta": "2024-01-31T14:30:00Z",
  "dropoffEta": "2024-01-31T15:00:00Z",
  "duration": 1800,
  "expiresAt": "2024-01-31T13:00:00Z"
}
```

### Create a Delivery

```bash
curl -X POST http://localhost:3001/delivery \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "seller-user-id",
    "provider": "uber_direct",
    "pickupAddress": {
      "street": "123 Farm Road",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90210",
      "country": "US",
      "latitude": 34.0522,
      "longitude": -118.2437
    },
    "pickupContact": {
      "firstName": "John",
      "lastName": "Farmer",
      "phoneNumber": "+15551234567",
      "email": "farmer@example.com",
      "companyName": "Green Valley Farm"
    },
    "pickupNotes": "Use back entrance",
    "dropoffAddress": {
      "street": "456 Customer St",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001",
      "country": "US",
      "latitude": 34.0407,
      "longitude": -118.2468
    },
    "dropoffContact": {
      "firstName": "Jane",
      "lastName": "Customer",
      "phoneNumber": "+15559876543",
      "email": "customer@example.com"
    },
    "dropoffNotes": "Ring doorbell",
    "items": [
      {
        "title": "Fresh Organic Tomatoes",
        "quantity": 2,
        "price": 9.98
      }
    ],
    "signatureRequired": true,
    "proofOfDeliveryRequired": true
  }'
```

**Expected Response:**
```json
{
  "id": "delivery-uuid",
  "status": "scheduled",
  "externalDeliveryId": "uber-delivery-id",
  "deliveryFee": 12.50,
  "currencyCode": "USD",
  "trackingUrl": "https://riders.uber.com/trips/...",
  "pickupEta": "2024-01-31T14:30:00Z",
  "dropoffEta": "2024-01-31T15:00:00Z",
  ...
}
```

### Track a Delivery

```bash
curl -X GET http://localhost:3001/delivery/DELIVERY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get All Deliveries

```bash
# Customer's deliveries
curl -X GET http://localhost:3001/delivery?role=customer \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Seller's deliveries
curl -X GET http://localhost:3001/delivery?role=seller \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Cancel a Delivery

```bash
curl -X POST http://localhost:3001/delivery/DELIVERY_ID/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Customer requested cancellation"
  }'
```

## Step 5: Configure Webhooks (Optional but Recommended)

Webhooks enable real-time updates from Uber Direct.

1. **Expose your local server** (for development):
   ```bash
   # Using ngrok
   ngrok http 3001
   ```

2. **Configure webhook in Uber Direct dashboard**:
   - URL: `https://your-ngrok-url.ngrok.io/delivery/webhooks/uber-direct`
   - Events:
     - `deliveries.status_changed`
     - `deliveries.courier_assigned`
     - `deliveries.pickup_complete`
     - `deliveries.delivered`

3. **Test webhook locally**:
   ```bash
   curl -X POST http://localhost:3001/delivery/webhooks/uber-direct \
     -H "Content-Type: application/json" \
     -H "x-uber-signature: test-signature" \
     -d '{
       "event_id": "event-123",
       "event_type": "deliveries.status_changed",
       "event_time": "2024-01-31T14:00:00Z",
       "resource_href": "/deliveries/delivery-id",
       "meta": {
         "user_id": "user-123",
         "resource_id": "delivery-id",
         "status": "pickup_complete"
       }
     }'
   ```

## Common Issues & Solutions

### Issue: "Uber Direct API error: Invalid credentials"
**Solution:** Double-check your `UBER_DIRECT_CUSTOMER_ID` and `UBER_DIRECT_CUSTOMER_SECRET` in `.env.development`

### Issue: "Service unavailable in this area"
**Solution:** Uber Direct has geographic limitations. Try addresses in supported cities or use sandbox mode for testing.

### Issue: "Invalid address"
**Solution:** Ensure addresses include all required fields (street, city, state, zipCode, country) and are valid locations.

### Issue: Migration fails
**Solution:**
```bash
# Check migration status
pnpm run migration:show

# If needed, revert and re-run
pnpm run migration:revert
pnpm run migration:run
```

## Testing Tips

### Use Sandbox Mode for Testing

Set this in your `.env.development`:
```bash
UBER_DIRECT_BASE_URL=https://sandbox-api.uber.com/v1/customers
```

### Test Addresses (Sandbox)

**Pickup:**
```
123 Test Street
San Francisco, CA 94103
```

**Dropoff:**
```
456 Sample Avenue
San Francisco, CA 94102
```

### Postman Collection

Import the API endpoints into Postman:

1. Create a new collection
2. Add authorization header: `Bearer YOUR_JWT_TOKEN`
3. Import all delivery endpoints from the documentation

## Integration Checklist

- [x] ✅ Delivery module created
- [x] ✅ Database migration ready
- [x] ✅ API endpoints available
- [ ] Get Uber Direct credentials
- [ ] Add credentials to `.env.development`
- [ ] Run migration
- [ ] Test quote endpoint
- [ ] Test delivery creation
- [ ] Configure webhooks
- [ ] Integrate with orders module
- [ ] Add to frontend UI

## Next Steps

1. **Integrate with Orders**: Connect delivery creation to your order flow
2. **Add to Frontend**: Display tracking info and delivery status
3. **Notifications**: Send email/SMS when delivery status changes
4. **Analytics**: Track delivery metrics and performance
5. **Production**: Switch to production Uber Direct credentials

## API Documentation

Full Swagger/OpenAPI documentation available at:
```
http://localhost:3001/api/docs
```

Navigate to the "Delivery" section to see all endpoints with request/response examples.

## Support

For detailed documentation, see:
- `UBER_DIRECT_DELIVERY.md` - Complete integration guide
- Uber Direct API Docs: https://developer.uber.com/docs/deliveries

## Example: Complete Order with Delivery

Here's a complete flow from cart to delivery:

```typescript
// 1. User adds items to cart
POST /cart/items
{ "productId": "...", "quantity": 2 }

// 2. Get delivery quote
POST /delivery/quote
{ "pickupAddress": "...", "dropoffAddress": "..." }

// 3. Create order (your orders module)
POST /orders
{
  "cartId": "...",
  "deliveryMethod": "uber_direct",
  "deliveryAddress": { ... }
}

// 4. Delivery is automatically created
// 5. Customer receives tracking URL
// 6. Webhook updates delivery status
// 7. Customer gets notified on delivery
```

That's it! You now have Uber Direct delivery fully integrated. 🚀
