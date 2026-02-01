# Cart Management System

A comprehensive shopping cart management system for the Agorva e-commerce platform.

## Features

- User-specific shopping carts
- Add products to cart with quantity validation
- Update cart item quantities and notes
- Remove items from cart
- Clear entire cart
- Automatic cart totals calculation (subtotal, tax, shipping, total)
- Product availability validation
- Stock quantity checks
- Min/max order quantity enforcement
- Cleanup unavailable products

## Database Schema

### Carts Table
- `id` (UUID) - Primary key
- `userId` (UUID) - Foreign key to users table
- `subtotal` (Decimal) - Sum of all cart items
- `tax` (Decimal) - Tax amount
- `shippingCost` (Decimal) - Shipping cost
- `total` (Decimal) - Final total amount
- `itemCount` (Integer) - Total number of items
- `lastActivityAt` (Timestamp) - Last cart activity
- `createdAt` (Timestamp) - Cart creation time
- `updatedAt` (Timestamp) - Last update time

### Cart Items Table
- `id` (UUID) - Primary key
- `cartId` (UUID) - Foreign key to carts table
- `productId` (UUID) - Foreign key to products table
- `quantity` (Integer) - Item quantity
- `unitPrice` (Decimal) - Price per unit
- `subtotal` (Decimal) - Line item total
- `notes` (Text) - Optional customer notes
- `createdAt` (Timestamp) - Item added time
- `updatedAt` (Timestamp) - Last update time

## API Endpoints

### Get Cart
```
GET /cart
```
Returns the current user's cart with all items and calculated totals.

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "Fresh Organic Tomatoes",
      "quantity": 2,
      "unitPrice": 4.99,
      "subtotal": 9.98,
      "notes": "Please select ripe ones",
      "productImage": "https://example.com/image.jpg",
      "isAvailable": true,
      "availableQuantity": 100
    }
  ],
  "subtotal": 9.98,
  "tax": 0.00,
  "shippingCost": 0.00,
  "total": 9.98,
  "itemCount": 2,
  "lastActivityAt": "2024-01-31T12:00:00Z",
  "createdAt": "2024-01-30T10:00:00Z",
  "updatedAt": "2024-01-31T12:00:00Z"
}
```

### Add Item to Cart
```
POST /cart/items
```

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 2,
  "notes": "Please select ripe ones"
}
```

**Validations:**
- Product must exist and be available
- Quantity must be at least 1
- Stock must be sufficient
- Quantity must meet minimum order requirements
- Quantity must not exceed maximum order limit

**Response:** Returns updated cart (same format as GET /cart)

### Update Cart Item
```
PUT /cart/items/:cartItemId
```

**Request Body:**
```json
{
  "quantity": 3,
  "notes": "Updated notes"
}
```

**Response:** Returns updated cart

### Remove Item from Cart
```
DELETE /cart/items/:cartItemId
```

**Response:** Returns updated cart

### Clear Cart
```
DELETE /cart
```
Removes all items from the cart.

**Response:**
```json
{
  "message": "Cart cleared successfully"
}
```

### Cleanup Unavailable Items
```
POST /cart/cleanup
```
Removes items that are no longer available or out of stock.

**Response:** Returns updated cart

## Setup Instructions

### 1. Run the Migration
```bash
npm run migration:run
```

This will create the `carts` and `cart_items` tables in your database.

### 2. Verify Installation
The cart module has been automatically registered in `app.module.ts`. The API endpoints will be available at `/cart`.

### 3. Test the Endpoints
All cart endpoints require authentication. Include a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Usage Examples

### Add Product to Cart
```bash
curl -X POST http://localhost:3000/cart/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-uuid",
    "quantity": 2,
    "notes": "Please select fresh ones"
  }'
```

### Get Current Cart
```bash
curl -X GET http://localhost:3000/cart \
  -H "Authorization: Bearer <token>"
```

### Update Cart Item
```bash
curl -X PUT http://localhost:3000/cart/items/<cart-item-id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }'
```

### Remove Item
```bash
curl -X DELETE http://localhost:3000/cart/items/<cart-item-id> \
  -H "Authorization: Bearer <token>"
```

## Business Logic

### Cart Creation
- Carts are automatically created when a user adds their first item
- One cart per user (identified by userId)

### Price Calculation
- Unit prices are captured at the time items are added
- Subtotals are recalculated when quantities change
- Cart totals are automatically updated after any modification
- Tax rate is currently set to 0% (can be configured)
- Shipping cost is set to 0 (can be calculated based on delivery rules)

### Inventory Management
- Stock availability is checked when adding/updating items
- Product min/max order quantities are enforced
- Cart automatically validates product availability

### Data Integrity
- Foreign key constraints ensure data consistency
- Unique constraint prevents duplicate products in same cart
- Cascade deletes remove cart items when cart is deleted
- Cart items are deleted when products are deleted

## Architecture

### Entities
- **Cart** (`src/cart/entities/cart.entity.ts`) - Main cart entity
- **CartItem** (`src/cart/entities/cart-item.entity.ts`) - Individual line items

### DTOs
- **AddToCartDto** - Validates add-to-cart requests
- **UpdateCartItemDto** - Validates update requests
- **CartResponseDto** - Formatted cart response

### Service
- **CartService** (`src/cart/cart.service.ts`) - Business logic for cart operations
  - Auto-creates carts for new users
  - Validates product availability and stock
  - Calculates totals and subtotals
  - Enforces order quantity rules

### Controller
- **CartController** (`src/cart/cart.controller.ts`) - REST API endpoints
  - JWT authentication required for all endpoints
  - User can only access their own cart

### Module
- **CartModule** (`src/cart/cart.module.ts`) - Dependency injection setup

## Error Handling

The service returns appropriate HTTP status codes:

- `200 OK` - Successful operation
- `201 Created` - Item added to cart
- `400 Bad Request` - Validation errors (insufficient stock, invalid quantity, etc.)
- `403 Forbidden` - User trying to access another user's cart
- `404 Not Found` - Product or cart item not found

## Future Enhancements

Potential features to add:
- [ ] Coupon/discount code support
- [ ] Dynamic tax calculation based on location
- [ ] Shipping cost calculation
- [ ] Cart expiration (auto-clear after X days)
- [ ] Save for later functionality
- [ ] Cart sharing/guest checkout
- [ ] Inventory reservation
- [ ] Product recommendations based on cart contents

## Integration with Orders

When implementing an orders module, use the cart data to:
1. Fetch the cart contents
2. Validate availability one final time
3. Create order records
4. Update product inventory
5. Clear the cart after successful order

Example:
```typescript
const cart = await cartService.getCart(userId);
// Validate and create order
await ordersService.createFromCart(cart);
await cartService.clearCart(userId);
```
