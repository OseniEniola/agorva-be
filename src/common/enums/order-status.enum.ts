// common/enums/order-status.enum.ts
export enum OrderStatus {
  PENDING = 'pending',           // Order placed, awaiting farmer confirmation
  CONFIRMED = 'confirmed',       // Farmer confirmed order
  PAYMENT_PENDING = 'payment_pending',  // Waiting for payment
  PAID = 'paid',                 // Payment received
  PROCESSING = 'processing',     // Farmer preparing order
  READY_TO_SHIP = 'ready_to_ship',  // Ready for pickup/delivery
  SHIPPED = 'shipped',           // Order shipped/in transit
  DELIVERED = 'delivered',       // Order delivered
  COMPLETED = 'completed',       // Transaction complete (payment released)
  CANCELLED = 'cancelled',       // Cancelled by buyer/seller
  REFUNDED = 'refunded',         // Payment refunded
  DISPUTED = 'disputed',         // Dispute raised
}