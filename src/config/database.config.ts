// config/database.config.ts
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'postgres', // or 'mysql', 'mariadb', 'sqlite', etc.
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'agorva_dev_1',
  database: process.env.DB_NAME || 'agorva_db',

  autoLoadEntities: true, 
  
  // Entity locations
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  
  // Auto-run migrations (only in development!)
  synchronize: process.env.TYPEORM_MIGRATIONS_SYNC === 'true', // ⚠️ NEVER true in production!
  
  // Logging
  logging: process.env.NODE_ENV === 'development',
  
  // Migration settings
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true',
  
  // Connection pooling for performance
  extra: {
    max: 20, // Maximum connections in pool
    min: 5,  // Minimum connections
    idleTimeoutMillis: 30000,
  },
  
  // SSL for production (important for hosted databases)
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
}));