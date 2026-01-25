import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductLocationFields1737744000000
  implements MigrationInterface
{
  name = 'AddProductLocationFields1737744000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable PostGIS extension if not already enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

    // Add denormalized location fields to products table
    await queryRunner.query(`
      ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "sellerLatitude" DECIMAL(10,8),
      ADD COLUMN IF NOT EXISTS "sellerLongitude" DECIMAL(11,8),
      ADD COLUMN IF NOT EXISTS "sellerLocation" geography(Point, 4326),
      ADD COLUMN IF NOT EXISTS "sellerAddress" VARCHAR,
      ADD COLUMN IF NOT EXISTS "sellerDeliveryRadiusKm" INTEGER;
    `);

    // Create indexes for latitude and longitude
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_sellerLatitude"
      ON "products" ("sellerLatitude");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_sellerLongitude"
      ON "products" ("sellerLongitude");
    `);

    // Create spatial index for PostGIS geography column
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_sellerLocation"
      ON "products" USING GIST ("sellerLocation");
    `);

    // Sync existing product locations from farmers
    await queryRunner.query(`
      UPDATE "products" p
      SET
        "sellerLatitude" = f.latitude,
        "sellerLongitude" = f.longitude,
        "sellerAddress" = f."farmAddress",
        "sellerDeliveryRadiusKm" = f."deliveryRadiusKm",
        "sellerLocation" = ST_SetSRID(ST_MakePoint(f.longitude, f.latitude), 4326)::geography
      FROM "farmers" f
      WHERE p."sellerId" = f."userId"
        AND p."sellerType" = 'farmer'
        AND f.latitude IS NOT NULL
        AND f.longitude IS NOT NULL;
    `);

    // Sync existing product locations from retailers
    await queryRunner.query(`
      UPDATE "products" p
      SET
        "sellerLatitude" = r.latitude,
        "sellerLongitude" = r.longitude,
        "sellerAddress" = r."businessAddress",
        "sellerDeliveryRadiusKm" = r."deliveryRadiusKm",
        "sellerLocation" = ST_SetSRID(ST_MakePoint(r.longitude, r.latitude), 4326)::geography
      FROM "retailers" r
      WHERE p."sellerId" = r."userId"
        AND p."sellerType" = 'retailer'
        AND r.latitude IS NOT NULL
        AND r.longitude IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_products_sellerLocation";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_products_sellerLongitude";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_products_sellerLatitude";
    `);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE "products"
      DROP COLUMN IF EXISTS "sellerDeliveryRadiusKm",
      DROP COLUMN IF EXISTS "sellerAddress",
      DROP COLUMN IF EXISTS "sellerLocation",
      DROP COLUMN IF EXISTS "sellerLongitude",
      DROP COLUMN IF EXISTS "sellerLatitude";
    `);
  }
}
