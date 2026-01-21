
import { ProductImage } from "../products/entities/product-image-entity";
import { Review } from "../products/entities/product-review-entity";
import { Product } from "../products/entities/products-entity";
import { Retailer } from "../retailers/entities/retailer.entities";
import { User } from "../users/entities/user.entity";
import { Farmer } from "../farmers/entities/farmer.entities";

import { DataSource } from "typeorm";
import * as dotenv from 'dotenv';



// Dynamically pick env file based on NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });
// Add all your entities here
const entities = [User, Retailer,Product,ProductImage,Review, Farmer];

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME ,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME ,
  synchronize: false, // CLI should not auto sync
  logging: false,
  entities,
  migrations: ['src/database/migrations/*{.ts,.js}'],
});
