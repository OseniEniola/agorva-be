/**
 * Script to generate business slugs for existing farmers and retailers
 * Run this after migrating the database to populate slugs for existing records
 *
 * Usage: ts-node src/common/scripts/generate-slugs.ts
 */

import { DataSource } from 'typeorm';
import { Farmer } from '../../farmers/entities/farmer.entities';
import { Retailer } from '../../retailers/entities/retailer.entities';
import { SlugUtil } from '../utils/slug.util';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

async function generateSlugs() {
  // Initialize database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [Farmer, Retailer],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const farmerRepo = dataSource.getRepository(Farmer);
    const retailerRepo = dataSource.getRepository(Retailer);

    // Get all existing slugs to avoid conflicts
    const existingSlugs = new Set<string>();

    // Generate slugs for farmers
    const farmers = await farmerRepo.find();
    console.log(`\n📊 Found ${farmers.length} farmers`);

    for (const farmer of farmers) {
      if (!farmer.businessSlug) {
        let slug = SlugUtil.generateSlug(farmer.farmName);

        // Ensure uniqueness
        while (existingSlugs.has(slug)) {
          slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
        }

        farmer.businessSlug = slug;
        existingSlugs.add(slug);

        await farmerRepo.save(farmer);
        console.log(`  ✓ Generated slug for farmer "${farmer.farmName}": ${slug}`);
      }
    }

    // Generate slugs for retailers
    const retailers = await retailerRepo.find();
    console.log(`\n📊 Found ${retailers.length} retailers`);

    for (const retailer of retailers) {
      if (!retailer.businessSlug) {
        let slug = SlugUtil.generateSlug(retailer.businessName);

        // Ensure uniqueness
        while (existingSlugs.has(slug)) {
          slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
        }

        retailer.businessSlug = slug;
        existingSlugs.add(slug);

        await retailerRepo.save(retailer);
        console.log(`  ✓ Generated slug for retailer "${retailer.businessName}": ${slug}`);
      }
    }

    console.log('\n✅ All slugs generated successfully!');
  } catch (error) {
    console.error('❌ Error generating slugs:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run the script
generateSlugs()
  .then(() => {
    console.log('\n🎉 Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
