// config/app.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-this',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // File uploads
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },

  // Email
  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT ?? '587', 10),
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM,
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },

  // Marketplace-specific
  marketplace: {
    platformFeePercentage: 5, // 5% commission
    minOrderValue: 10,
    maxOrderValue: 10000,
    deliveryRadius: 50, // km
  },

  // Swagger configuration
  swagger: {
    enabled: process.env.ENABLE_API_DOCS === 'true', // Only enable when needed
  },
}));