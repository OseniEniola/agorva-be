// config/swagger.config.ts
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Agorva Marketplace API')
    .setDescription(
      'API documentation for Farmers, Retailers, and Consumers marketplace.\n\n' +
      '## Features\n' +
      '- User authentication (JWT)\n' +
      '- Role-based access control (Farmer, Retailer, Consumer, Admin)\n' +
      '- Product listings and inventory management\n' +
      '- Order processing and payment integration\n' +
      '- Reviews and ratings\n\n' +
      '## Authentication\n' +
      '1. Register or login to get a JWT token\n' +
      '2. Click the "Authorize" button (top right)\n' +
      '3. Enter your token\n' +
      '4. All protected endpoints will use this token automatically'
    )
    .setVersion('1.0')
    .setContact(
      'Agorva Marketplace Support',
      'https://agorva.com',
      'support@agorva.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    
    // Tags (organized groups)
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Users', 'User account management')
    .addTag('Farmers', 'Farmer profiles and farm management')
    .addTag('Retailers', 'Retailer profiles and store management')
    .addTag('Consumers', 'Consumer profiles and preferences')
    .addTag('Products', 'Product catalog and categories')
    .addTag('Enums', 'Enumeration values for dropdowns and filters')
     /*.addTag('Listings', 'Product listings and inventory')
    .addTag('Orders', 'Order placement and tracking')
    .addTag('Payments', 'Payment processing and transactions')
    .addTag('Reviews', 'Product and seller reviews')
    .addTag('Notifications', 'Push notifications and alerts')
    .addTag('Analytics', 'Business analytics and reports')
     */
    // Security - JWT Bearer Authentication
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name must match @ApiBearerAuth() in controllers
    )
    
    // Servers
    .addServer('http://localhost:3001', 'Local Development')
    .addServer('https://agorva-be.onrender.com/', 'Staging Environment')
    .addServer('https://api.agorva.com', 'Production')
    
    .build();

  // Create document
  const document = SwaggerModule.createDocument(app, config, {
    // Add extra options
    deepScanRoutes: true, // Scan nested routes
    ignoreGlobalPrefix: false,
  });

  // Setup Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keep JWT after page refresh
      tagsSorter: 'alpha', // Sort tags alphabetically
      operationsSorter: 'alpha', // Sort operations alphabetically
      docExpansion: 'none', // Collapse all sections by default
      filter: true, // Enable search filter
      showRequestDuration: true, // Show request duration
      tryItOutEnabled: true, // Enable "Try it out" by default
    },
    customSiteTitle: 'Agorva Marketplace API Documentation',
    customfavIcon: 'https://agorva.com/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .scheme-container { 
        background: #fafafa; 
        box-shadow: none; 
        padding: 20px;
        margin: 20px 0;
      }
    `,
  });

  console.log(`📚 Swagger documentation available at: http://localhost:3001/api/docs`);
}