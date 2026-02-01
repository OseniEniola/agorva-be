import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LocationsModule } from './locations/locations.module';
import { FarmersModule } from './farmers/farmers.module';
import { RetailersModule } from './retailers/retailers.module';
import { ProductsModule } from './products/products.module';
import { EnumsModule } from './enums/enums.module';
import { EmailModule } from './email/email.module';
import { CartModule } from './cart/cart.module';
import { DeliveryModule } from './delivery/delivery.module';

@Module({
  imports: [
    // Load configuration
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available everywhere
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [databaseConfig, appConfig],
    }),

    // Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        if (!dbConfig) {
          throw new Error('Database configuration is missing');
        }
        return dbConfig;
      },
    }),

    UsersModule,

    AuthModule,

    LocationsModule,

    FarmersModule,

    RetailersModule,

    ProductsModule,

    EnumsModule,

    EmailModule,

    CartModule,

    DeliveryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
