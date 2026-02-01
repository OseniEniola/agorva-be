# Uber Direct Delivery Integration

Comprehensive integration with Uber Direct API for on-demand delivery services.

## Overview

This module provides a complete delivery management system with Uber Direct integration, enabling:
- Real-time delivery quotes
- On-demand delivery scheduling
- Live tracking and status updates
- Proof of delivery collection
- Multi-provider support (Uber Direct, self-delivery, pickup)

## Features

- **Delivery Management**
  - Create and schedule deliveries
  - Get delivery quotes before creating orders
  - Track delivery status in real-time
  - Cancel deliveries
  - View delivery history

- **Uber Direct Integration**
  - Automatic delivery creation via Uber Direct API
  - Real-time tracking URLs
  - Courier information and location
  - Proof of delivery (signature and photo)
  - ETA updates

- **Webhook Support**
  - Receive real-time status updates from Uber Direct
  - Automatic delivery status synchronization
  - Courier location updates

- **Flexible Delivery Options**
  - Uber Direct on-demand delivery
  - Self-delivery by seller
  - Pickup at seller location

## Database Schema

### Deliveries Table
- `id` (UUID) - Primary key
- `orderId` (UUID) - Optional order reference
- `customerId` (UUID) - Customer ID
- `sellerId` (UUID) - Seller ID
- `provider` (Enum) - uber_direct | self_delivery | pickup
- `status` (Enum) - Delivery status
- `externalDeliveryId` (String) - Uber Direct delivery ID
- `quoteId` (String) - Quote reference
- `deliveryFee` (Decimal) - Delivery cost
- `currencyCode` (String) - Currency
- `trackingUrl` (String) - Live tracking URL
- `pickupAddress` (JSON) - Pickup location details
- `pickupContact` (JSON) - Seller contact info
- `pickupNotes` (Text) - Special pickup instructions
- `dropoffAddress` (JSON) - Delivery location details
- `dropoffContact` (JSON) - Customer contact info
- `dropoffNotes` (Text) - Delivery instructions
- `signatureRequired` (Boolean) - Require signature
- `proofOfDeliveryRequired` (Boolean) - Require photo
- `items` (JSON) - Items being delivered
- `courier` (JSON) - Courier details (name, phone, location, vehicle)
- `pickupEta` (Timestamp) - Estimated pickup time
- `dropoffEta` (Timestamp) - Estimated delivery time
- `deliveredAt` (Timestamp) - Actual delivery time
- `scheduledPickupTime` (Timestamp) - Scheduled pickup
- `scheduledDropoffTime` (Timestamp) - Scheduled delivery
- `proofOfDelivery` (JSON) - Signature and photo URLs
- `metadata` (JSON) - Additional data
- `cancellationReason` (Text) - Why canceled
- `failureReason` (Text) - Why failed

### Delivery Statuses
- `pending` - Delivery created, not yet scheduled
- `quote_obtained` - Got delivery quote
- `scheduled` - Delivery scheduled with provider
- `pickup` - Courier heading to pickup
- `pickup_complete` - Items picked up
- `in_transit` - En route to customer
- `delivered` - Successfully delivered
- `canceled` - Delivery canceled
- `returned` - Returned to seller
- `failed` - Delivery failed

## API Endpoints

### Get Delivery Quote
```
POST /delivery/quote
```

Get a delivery cost estimate before creating the delivery.

**Request Body:**
```json
{
  "pickupAddress": "123 Farm Road, California, 90210",
  "dropoffAddress": "456 Customer St, Los Angeles, 90001",
  "pickupLatitude": 34.0522,
  "pickupLongitude": -118.2437,
  "dropoffLatitude": 34.0407,
  "dropoffLongitude": -118.2468
}
```

**Response:**
```json
{
  "quoteId": "quote-uuid",
  "fee": 12.50,
  "currencyCode": "USD",
  "pickupEta": "2024-01-31T14:30:00Z",
  "dropoffEta": "2024-01-31T15:00:00Z",
  "duration": 1800,
  "expiresAt": "2024-01-31T13:00:00Z"
}
```

### Create Delivery
```
POST /delivery
```

Create a new delivery with Uber Direct.

**Request Body:**
```json
{
  "orderId": "order-uuid",
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
    "email": "john@farm.com",
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
    "email": "jane@email.com"
  },
  "dropoffNotes": "Please ring doorbell",
  "items": [
    {
      "title": "Fresh Organic Tomatoes",
      "quantity": 2,
      "price": 9.98
    }
  ],
  "signatureRequired": true,
  "proofOfDeliveryRequired": true,
  "scheduledPickupTime": "2024-01-31T14:00:00Z"
}
```

**Response:**
```json
{
  "id": "delivery-uuid",
  "orderId": "order-uuid",
  "customerId": "customer-uuid",
  "sellerId": "seller-uuid",
  "provider": "uber_direct",
  "status": "scheduled",
  "externalDeliveryId": "uber-delivery-id",
  "deliveryFee": 12.50,
  "currencyCode": "USD",
  "trackingUrl": "https://riders.uber.com/trips/...",
  "pickupAddress": { ... },
  "dropoffAddress": { ... },
  "pickupEta": "2024-01-31T14:30:00Z",
  "dropoffEta": "2024-01-31T15:00:00Z",
  "createdAt": "2024-01-31T13:00:00Z",
  "updatedAt": "2024-01-31T13:00:00Z"
}
```

### Get Delivery
```
GET /delivery/:id
```

Get delivery details and current status.

**Response:**
```json
{
  "id": "delivery-uuid",
  "status": "in_transit",
  "trackingUrl": "https://riders.uber.com/trips/...",
  "courier": {
    "name": "Mike Driver",
    "phoneNumber": "+15551112222",
    "location": {
      "latitude": 34.0450,
      "longitude": -118.2500
    },
    "imageUrl": "https://...",
    "vehicleType": "car"
  },
  "pickupEta": "2024-01-31T14:30:00Z",
  "dropoffEta": "2024-01-31T15:00:00Z",
  ...
}
```

### Get User Deliveries
```
GET /delivery?role=customer
GET /delivery?role=seller
```

Get all deliveries for the authenticated user.

**Query Parameters:**
- `role` - "customer" (default) or "seller"

**Response:**
```json
[
  {
    "id": "delivery-uuid",
    "status": "delivered",
    "deliveryFee": 12.50,
    "deliveredAt": "2024-01-31T15:05:00Z",
    ...
  }
]
```

### Cancel Delivery
```
POST /delivery/:id/cancel
```

Cancel a pending or scheduled delivery.

**Request Body:**
```json
{
  "reason": "Customer requested cancellation"
}
```

### Webhook Endpoint
```
POST /delivery/webhooks/uber-direct
```

Receives real-time updates from Uber Direct. This endpoint should be configured in your Uber Direct dashboard.

**Headers:**
- `x-uber-signature` - Webhook signature for verification

## Setup Instructions

### 1. Get Uber Direct Credentials

1. Sign up for Uber Direct at https://www.uber.com/business/uber-direct
2. Get your Customer ID and Customer Secret from the dashboard
3. Add credentials to your `.env` file:

```bash
UBER_DIRECT_CUSTOMER_ID=your_customer_id_here
UBER_DIRECT_CUSTOMER_SECRET=your_customer_secret_here
UBER_DIRECT_BASE_URL=https://api.uber.com/v1/customers
```

### 2. Run Database Migration

```bash
# Run the delivery table migration
pnpm run migration:run
```

This creates the `deliveries` table with all necessary fields and indexes.

### 3. Configure Webhooks

1. Go to Uber Direct dashboard
2. Navigate to Webhooks settings
3. Add webhook URL: `https://your-domain.com/delivery/webhooks/uber-direct`
4. Subscribe to events:
   - `deliveries.status_changed`
   - `deliveries.courier_assigned`
   - `deliveries.pickup_complete`
   - `deliveries.delivered`

### 4. Test the Integration

```bash
# Get a delivery quote
curl -X POST http://localhost:3000/delivery/quote \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupAddress": "123 Farm Road, CA 90210",
    "dropoffAddress": "456 Customer St, LA 90001"
  }'

# Create a delivery
curl -X POST http://localhost:3000/delivery \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d @delivery-request.json
```

## Integration with Orders

When implementing your orders module, integrate delivery as follows:

```typescript
import { DeliveryService } from './delivery/delivery.service';

// In your OrdersService
async createOrder(userId: string, orderData: CreateOrderDto) {
  // 1. Create order
  const order = await this.ordersRepository.save({
    userId,
    ...orderData,
  });

  // 2. If delivery requested, create delivery
  if (orderData.deliveryMethod === 'uber_direct') {
    const delivery = await this.deliveryService.createDelivery(userId, {
      orderId: order.id,
      sellerId: order.sellerId,
      provider: DeliveryProvider.UBER_DIRECT,
      pickupAddress: order.pickupAddress,
      pickupContact: order.sellerContact,
      dropoffAddress: order.deliveryAddress,
      dropoffContact: order.customerContact,
      items: order.items.map(item => ({
        title: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      signatureRequired: true,
      proofOfDeliveryRequired: true,
    });

    order.deliveryId = delivery.id;
    await this.ordersRepository.save(order);
  }

  return order;
}
```

## Business Logic

### Delivery Flow

1. **Customer Checkout**
   - Customer adds items to cart
   - Selects delivery option
   - Gets delivery quote at checkout

2. **Order Creation**
   - Order is created
   - Delivery is automatically scheduled if selected
   - Uber Direct assigns courier

3. **Pickup**
   - Courier receives pickup notification
   - Courier heads to seller location
   - Seller hands over items
   - Courier confirms pickup

4. **In Transit**
   - Real-time tracking available
   - Customer receives ETA updates
   - Courier location visible

5. **Delivery**
   - Courier arrives at customer location
   - Collects signature/photo if required
   - Marks as delivered
   - Customer and seller notified

### Cost Calculation

Delivery fees are calculated by Uber Direct based on:
- Distance between pickup and dropoff
- Time of day
- Demand in the area
- Vehicle type required
- Special requirements (signature, photo, etc.)

Get a quote before creating the delivery to show customers the cost.

### Webhook Events

The system automatically updates delivery status when receiving webhooks:

- `deliveries.courier_assigned` → Updates courier info
- `deliveries.status_changed` → Updates status and ETAs
- `deliveries.pickup_complete` → Marks pickup complete
- `deliveries.delivered` → Marks delivered, stores proof

## Error Handling

Common errors and solutions:

- **400 Bad Request** - Invalid address or missing required fields
- **401 Unauthorized** - Invalid API credentials
- **404 Not Found** - Delivery or resource not found
- **422 Unprocessable** - Service unavailable in area

## Security

- API credentials stored in environment variables
- Webhook signature verification (implement in controller)
- User authorization checks (users can only access their own deliveries)
- Sensitive data not logged

## Testing

### Sandbox Mode

Uber Direct provides a sandbox environment for testing:

```bash
UBER_DIRECT_BASE_URL=https://sandbox-api.uber.com/v1/customers
```

### Test Addresses

Use these addresses for testing in sandbox:

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

## Monitoring

Track delivery metrics:
- Average delivery time
- Delivery success rate
- Cancellation rate
- Customer satisfaction
- Cost per delivery

Query deliveries by status:
```sql
SELECT status, COUNT(*)
FROM deliveries
GROUP BY status;
```

## Cost Optimization

Tips to reduce delivery costs:
1. Batch deliveries when possible
2. Schedule deliveries during off-peak hours
3. Use optimized pickup locations
4. Communicate clear pickup/dropoff instructions
5. Reduce cancellations through better planning

## Next Steps

1. ✅ Set up Uber Direct account
2. ✅ Add credentials to environment
3. ✅ Run migration
4. ✅ Configure webhooks
5. Integrate with orders module
6. Add delivery cost to order totals
7. Send delivery notifications to customers
8. Display tracking info in customer dashboard
9. Add delivery history for sellers
10. Implement delivery analytics

## Support

- Uber Direct API Docs: https://developer.uber.com/docs/deliveries
- Support: https://help.uber.com/business
- Status Page: https://status.uber.com

## Future Enhancements

- [ ] Multiple delivery quotes from different providers
- [ ] Scheduled delivery windows
- [ ] Recurring deliveries
- [ ] Delivery insurance
- [ ] Customer delivery preferences
- [ ] Geofencing for delivery zones
- [ ] Route optimization for multiple pickups
- [ ] Integration with other delivery providers (DoorDash, Postmates)
