import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1770667892545 implements MigrationInterface {
    name = 'InitialMigration1770667892545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."farmers_farmingmethods_enum" AS ENUM(
                'organic',
                'conventional',
                'regenerative',
                'biodynamic',
                'permaculture',
                'hydroponic',
                'aquaponic',
                'greenhouse',
                'pasture_raised',
                'free_range'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."farmers_certifications_enum" AS ENUM(
                'organic',
                'certified_organic',
                'non_gmo',
                'non_gmo_verified',
                'pesticide_free',
                'herbicide_free',
                'chemical_free',
                'grass_fed',
                'pasture_raised',
                'free_range',
                'cage_free',
                'humanely_raised',
                'no_antibiotics',
                'no_hormones',
                'halal',
                'kosher',
                'locally_grown',
                'fair_trade',
                'rainforest_alliance',
                'sustainable',
                'regenerative',
                'biodynamic',
                'usda_inspected',
                'fda_approved',
                'food_safety_certified',
                'gluten_free',
                'vegan',
                'vegetarian',
                'dairy_free',
                'nut_free',
                'heirloom',
                'wild_caught',
                'farm_raised',
                'handmade',
                'small_batch'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."farmers_deliverydays_enum" AS ENUM(
                'MONDAY',
                'TUESDAY',
                'WEDNESDAY',
                'THURSDAY',
                'FRIDAY',
                'SATURDAY',
                'SUNDAY'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."farmers_status_enum" AS ENUM('pending', 'verified', 'suspended', 'rejected')
        `);
        await queryRunner.query(`
            CREATE TABLE "farmers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "farmName" character varying NOT NULL,
                "businessSlug" character varying,
                "description" text,
                "latitude" numeric(10, 8),
                "longitude" numeric(11, 8),
                "farmAddress" character varying,
                "city" character varying,
                "province" character varying,
                "postalCode" character varying,
                "farmSizeAcres" numeric(10, 2),
                "farmingMethods" "public"."farmers_farmingmethods_enum" array,
                "certifications" "public"."farmers_certifications_enum" array,
                "certificationDocuments" jsonb,
                "businessRegistrationNumber" character varying,
                "taxId" character varying,
                "bankAccountNumber" character varying,
                "bankRoutingNumber" character varying,
                "bankAccountHolderName" character varying,
                "deliveryRadiusKm" integer NOT NULL DEFAULT '25',
                "minimumOrderAmount" numeric(10, 2) NOT NULL DEFAULT '0',
                "deliveryDays" "public"."farmers_deliverydays_enum" array,
                "pickupLocations" jsonb,
                "status" "public"."farmers_status_enum" NOT NULL DEFAULT 'pending',
                "isVerified" boolean NOT NULL DEFAULT false,
                "verificationNotes" text,
                "verifiedAt" TIMESTAMP,
                "profileImage" character varying,
                "farmImages" text,
                "averageRating" numeric(3, 2) NOT NULL DEFAULT '0',
                "totalReviews" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_544ece4dfcb232355851fee6e5e" UNIQUE ("businessSlug"),
                CONSTRAINT "REL_f265c73707b83aaea76d800ffc" UNIQUE ("userId"),
                CONSTRAINT "PK_ccbe91e5e64dde1329b4c153637" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."retailers_businesstype_enum" AS ENUM(
                'grocery_store',
                'restaurant',
                'cafe',
                'bakery',
                'butcher',
                'farmers_market',
                'food_truck',
                'caterer',
                'wholesaler',
                'distributor',
                'specialty_store',
                'online_retailer',
                'other'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."retailers_deliverydays_enum" AS ENUM(
                'MONDAY',
                'TUESDAY',
                'WEDNESDAY',
                'THURSDAY',
                'FRIDAY',
                'SATURDAY',
                'SUNDAY'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."retailers_status_enum" AS ENUM('pending', 'verified', 'suspended', 'rejected')
        `);
        await queryRunner.query(`
            CREATE TABLE "retailers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "businessName" character varying NOT NULL,
                "businessSlug" character varying,
                "businessType" "public"."retailers_businesstype_enum" NOT NULL DEFAULT 'grocery_store',
                "description" text,
                "website" character varying,
                "latitude" numeric(10, 8),
                "longitude" numeric(11, 8),
                "businessAddress" character varying NOT NULL,
                "city" character varying,
                "province" character varying,
                "postalCode" character varying,
                "country" character varying,
                "operatingHours" jsonb,
                "businessRegistrationNumber" character varying,
                "taxId" character varying,
                "businessLicenseNumber" character varying,
                "businessLicenseExpiry" TIMESTAMP,
                "bankAccountNumber" character varying,
                "bankRoutingNumber" character varying,
                "bankAccountHolderName" character varying,
                "bankName" character varying,
                "offersDelivery" boolean NOT NULL DEFAULT false,
                "offersPickup" boolean NOT NULL DEFAULT true,
                "deliveryRadiusKm" integer,
                "minimumOrderAmount" numeric(10, 2) NOT NULL DEFAULT '0',
                "deliveryDays" "public"."retailers_deliverydays_enum" array,
                "pickupLocations" jsonb,
                "preferredProductCategories" text,
                "preferredCertifications" text,
                "estimatedMonthlyPurchaseVolume" numeric(10, 2),
                "status" "public"."retailers_status_enum" NOT NULL DEFAULT 'pending',
                "isVerified" boolean NOT NULL DEFAULT false,
                "verificationNotes" text,
                "verifiedAt" TIMESTAMP,
                "verifiedBy" character varying,
                "businessDocuments" jsonb,
                "logo" character varying,
                "storeImages" text,
                "averageRating" numeric(3, 2) NOT NULL DEFAULT '0',
                "totalReviews" integer NOT NULL DEFAULT '0',
                "totalOrders" integer NOT NULL DEFAULT '0',
                "contactPersonName" character varying,
                "contactPersonTitle" character varying,
                "businessPhone" character varying,
                "businessEmail" character varying,
                "acceptsNewOrders" boolean NOT NULL DEFAULT true,
                "specialRequirements" text,
                "paymentMethods" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_675fbfe4bd15b67437428947601" UNIQUE ("businessSlug"),
                CONSTRAINT "PK_1228653999402b52e75d40b1c66" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM('farmer', 'retailer', 'consumer', 'admin')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_status_enum" AS ENUM('pending', 'active', 'suspended')
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'consumer',
                "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending',
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "phoneNo" character varying NOT NULL,
                "address" character varying NOT NULL,
                "location" geography(Point, 4326),
                "refreshToken" character varying,
                "emailVerificationToken" character varying,
                "passwordResetToken" character varying,
                "passwordResetExpires" TIMESTAMP,
                "twoFactorEnabled" boolean NOT NULL DEFAULT false,
                "twoFactorSecret" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "lastLoginAt" TIMESTAMP,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "reviews" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "productId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                "rating" integer NOT NULL,
                "comment" text,
                "isVerifiedPurchase" boolean NOT NULL DEFAULT false,
                "helpfulCount" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_9007ffba411fd471dfe233dabf" ON "reviews" ("productId", "userId")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."products_category_enum" AS ENUM(
                'vegetables',
                'fruits',
                'herbs',
                'mushrooms',
                'sprouts',
                'dairy',
                'meat',
                'poultry',
                'seafood',
                'eggs',
                'grains',
                'legumes',
                'nuts',
                'seeds',
                'flour',
                'pasta',
                'rice',
                'baked_goods',
                'preserves',
                'jams_jellies',
                'pickles',
                'sauces',
                'condiments',
                'cheese',
                'yogurt',
                'juice',
                'milk',
                'tea',
                'coffee',
                'honey',
                'maple_syrup',
                'oils',
                'vinegar',
                'ready_to_eat',
                'frozen',
                'dried',
                'flowers',
                'plants',
                'other'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."products_status_enum" AS ENUM(
                'draft',
                'active',
                'out_of_stock',
                'low_stock',
                'discontinued',
                'seasonal',
                'pending_approval',
                'rejected'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."products_unit_enum" AS ENUM(
                'kg',
                'gram',
                'lb',
                'ounce',
                'ton',
                'liter',
                'milliliter',
                'gallon',
                'quart',
                'pint',
                'cup',
                'piece',
                'dozen',
                'half_dozen',
                'bunch',
                'head',
                'bag',
                'box',
                'pack',
                'bundle',
                'carton',
                'crate',
                'jar',
                'bottle',
                'can',
                'container'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."products_certifications_enum" AS ENUM(
                'organic',
                'certified_organic',
                'non_gmo',
                'non_gmo_verified',
                'pesticide_free',
                'herbicide_free',
                'chemical_free',
                'grass_fed',
                'pasture_raised',
                'free_range',
                'cage_free',
                'humanely_raised',
                'no_antibiotics',
                'no_hormones',
                'halal',
                'kosher',
                'locally_grown',
                'fair_trade',
                'rainforest_alliance',
                'sustainable',
                'regenerative',
                'biodynamic',
                'usda_inspected',
                'fda_approved',
                'food_safety_certified',
                'gluten_free',
                'vegan',
                'vegetarian',
                'dairy_free',
                'nut_free',
                'heirloom',
                'wild_caught',
                'farm_raised',
                'handmade',
                'small_batch'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."products_condition_enum" AS ENUM(
                'fresh',
                'excellent',
                'good',
                'fair',
                'imperfect',
                'slightly_damaged',
                'overripe',
                'near_expiry'
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."products_sellertype_enum" AS ENUM('farmer', 'retailer')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."products_origin_enum" AS ENUM('local', 'regional', 'national', 'imported')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."products_storagetype_enum" AS ENUM('ambient', 'refrigerated', 'frozen', 'cool_dry')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."products_shippingmethod_enum" AS ENUM(
                'standard',
                'refrigerated',
                'frozen',
                'fragile',
                'perishable',
                'no_shipping'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "products" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text NOT NULL,
                "shortDescription" text,
                "category" "public"."products_category_enum" NOT NULL DEFAULT 'other',
                "status" "public"."products_status_enum" NOT NULL DEFAULT 'draft',
                "price" numeric(10, 2) NOT NULL,
                "compareAtPrice" numeric(10, 2),
                "quantity" integer NOT NULL DEFAULT '0',
                "unit" "public"."products_unit_enum" NOT NULL DEFAULT 'kg',
                "minOrderQuantity" integer NOT NULL DEFAULT '0',
                "maxOrderQuantity" integer,
                "sku" character varying,
                "barcode" character varying,
                "tags" text,
                "certifications" "public"."products_certifications_enum" array NOT NULL DEFAULT '{}',
                "condition" "public"."products_condition_enum" NOT NULL DEFAULT 'fresh',
                "conditionNotes" text,
                "sellerId" uuid NOT NULL,
                "sellerType" "public"."products_sellertype_enum" NOT NULL,
                "businessName" character varying,
                "originLocation" character varying,
                "origin" "public"."products_origin_enum" NOT NULL DEFAULT 'local',
                "distanceFromBuyer" integer,
                "sellerLatitude" numeric(10, 8),
                "sellerLongitude" numeric(11, 8),
                "sellerLocation" geography(Point, 4326),
                "sellerAddress" character varying,
                "sellerDeliveryRadiusKm" integer,
                "isAvailable" boolean NOT NULL DEFAULT true,
                "availableFrom" TIMESTAMP,
                "availableUntil" TIMESTAMP,
                "harvestDate" date,
                "expiryDate" date,
                "storageType" "public"."products_storagetype_enum" NOT NULL DEFAULT 'ambient',
                "requiresRefrigeration" boolean NOT NULL DEFAULT false,
                "shippingMethod" "public"."products_shippingmethod_enum" NOT NULL DEFAULT 'standard',
                "isShippable" boolean NOT NULL DEFAULT true,
                "pickupOnly" boolean NOT NULL DEFAULT false,
                "weight" numeric(10, 2),
                "isFragile" boolean NOT NULL DEFAULT false,
                "isPerishable" boolean NOT NULL DEFAULT false,
                "averageRating" numeric(3, 2) NOT NULL DEFAULT '0',
                "reviewCount" integer NOT NULL DEFAULT '0',
                "slug" character varying NOT NULL,
                "metaTitle" character varying,
                "metaDescription" text,
                "viewCount" integer NOT NULL DEFAULT '0',
                "salesCount" integer NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "publishedAt" TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_464f927ae360106b783ed0b4106" UNIQUE ("slug"),
                CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e40a1dd2909378f0da1f34f7bd" ON "products" ("sellerId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d41b47959cb6c367a5ffc58e89" ON "products" ("sellerLatitude")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a44d9d7c2c0f89d8ed3071aadd" ON "products" ("sellerLongitude")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_572c5e5eaa86fedef08bbae2b7" ON "products" USING GiST ("sellerLocation")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8cac65f09aada4d9b4b47a87ba" ON "products" ("sellerType", "status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f58772600ed891d77a7504cecd" ON "products" ("sellerId", "status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8d31efd037a7a90fc8a5616df7" ON "products" ("category", "status")
        `);
        await queryRunner.query(`
            CREATE TABLE "product_images" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "url" character varying NOT NULL,
                "thumbnailUrl" character varying,
                "altText" character varying,
                "sortOrder" integer NOT NULL DEFAULT '0',
                "isPrimary" boolean NOT NULL DEFAULT false,
                "productId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "cart_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "cartId" uuid NOT NULL,
                "productId" uuid NOT NULL,
                "quantity" integer NOT NULL DEFAULT '1',
                "unitPrice" numeric(10, 2) NOT NULL,
                "subtotal" numeric(10, 2) NOT NULL,
                "notes" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_edd714311619a5ad0952504583" ON "cart_items" ("cartId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_72679d98b31c737937b8932ebe" ON "cart_items" ("productId")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_2bf7996b7946ce753b60a87468" ON "cart_items" ("cartId", "productId")
        `);
        await queryRunner.query(`
            CREATE TABLE "carts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "subtotal" numeric(10, 2) NOT NULL DEFAULT '0',
                "tax" numeric(10, 2) NOT NULL DEFAULT '0',
                "shippingCost" numeric(10, 2) NOT NULL DEFAULT '0',
                "total" numeric(10, 2) NOT NULL DEFAULT '0',
                "itemCount" integer NOT NULL DEFAULT '0',
                "lastActivityAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_69828a178f152f157dcf2f70a8" ON "carts" ("userId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_69828a178f152f157dcf2f70a8" ON "carts" ("userId")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."deliveries_provider_enum" AS ENUM('uber_direct', 'self_delivery', 'pickup')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."deliveries_status_enum" AS ENUM(
                'pending',
                'quote_obtained',
                'scheduled',
                'pickup',
                'pickup_complete',
                'in_transit',
                'delivered',
                'canceled',
                'returned',
                'failed'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "deliveries" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "orderId" character varying,
                "customerId" uuid NOT NULL,
                "sellerId" uuid NOT NULL,
                "provider" "public"."deliveries_provider_enum" NOT NULL DEFAULT 'uber_direct',
                "status" "public"."deliveries_status_enum" NOT NULL DEFAULT 'pending',
                "externalDeliveryId" character varying,
                "quoteId" character varying,
                "deliveryFee" numeric(10, 2),
                "currencyCode" character varying,
                "trackingUrl" character varying,
                "pickupAddress" json NOT NULL,
                "pickupContact" json NOT NULL,
                "pickupNotes" text,
                "dropoffAddress" json NOT NULL,
                "dropoffContact" json NOT NULL,
                "dropoffNotes" text,
                "signatureRequired" boolean NOT NULL DEFAULT false,
                "proofOfDeliveryRequired" boolean NOT NULL DEFAULT false,
                "items" json,
                "courier" json,
                "pickupEta" TIMESTAMP,
                "dropoffEta" TIMESTAMP,
                "deliveredAt" TIMESTAMP,
                "scheduledPickupTime" TIMESTAMP,
                "scheduledDropoffTime" TIMESTAMP,
                "proofOfDelivery" json,
                "metadata" json,
                "cancellationReason" text,
                "failureReason" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_a6ef225c5c5f0974e503bfb731f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f7433e3639e213f901e22cf864" ON "deliveries" ("orderId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5cbaf0bed7a55ec4da5d4e558d" ON "deliveries" ("customerId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_176207b0285713bd9ae6d14f70" ON "deliveries" ("sellerId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3235c9c06d9d3028a11ec8081d" ON "deliveries" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3235c9c06d9d3028a11ec8081d" ON "deliveries" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f7433e3639e213f901e22cf864" ON "deliveries" ("orderId")
        `);
        await queryRunner.query(`
            ALTER TABLE "farmers"
            ADD CONSTRAINT "FK_f265c73707b83aaea76d800ffcf" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "retailers"
            ADD CONSTRAINT "FK_a3434a444e8d5eb497baff5773b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "reviews"
            ADD CONSTRAINT "FK_a6b3c434392f5d10ec171043666" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "reviews"
            ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "products"
            ADD CONSTRAINT "FK_e40a1dd2909378f0da1f34f7bd6" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "product_images"
            ADD CONSTRAINT "FK_b367708bf720c8dd62fc6833161" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_items"
            ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_items"
            ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD CONSTRAINT "FK_5cbaf0bed7a55ec4da5d4e558d3" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD CONSTRAINT "FK_176207b0285713bd9ae6d14f701" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP CONSTRAINT "FK_176207b0285713bd9ae6d14f701"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP CONSTRAINT "FK_5cbaf0bed7a55ec4da5d4e558d3"
        `);
        await queryRunner.query(`
            ALTER TABLE "carts" DROP CONSTRAINT "FK_69828a178f152f157dcf2f70a89"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_items" DROP CONSTRAINT "FK_72679d98b31c737937b8932ebe6"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_images" DROP CONSTRAINT "FK_b367708bf720c8dd62fc6833161"
        `);
        await queryRunner.query(`
            ALTER TABLE "products" DROP CONSTRAINT "FK_e40a1dd2909378f0da1f34f7bd6"
        `);
        await queryRunner.query(`
            ALTER TABLE "reviews" DROP CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f"
        `);
        await queryRunner.query(`
            ALTER TABLE "reviews" DROP CONSTRAINT "FK_a6b3c434392f5d10ec171043666"
        `);
        await queryRunner.query(`
            ALTER TABLE "retailers" DROP CONSTRAINT "FK_a3434a444e8d5eb497baff5773b"
        `);
        await queryRunner.query(`
            ALTER TABLE "farmers" DROP CONSTRAINT "FK_f265c73707b83aaea76d800ffcf"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f7433e3639e213f901e22cf864"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3235c9c06d9d3028a11ec8081d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3235c9c06d9d3028a11ec8081d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_176207b0285713bd9ae6d14f70"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5cbaf0bed7a55ec4da5d4e558d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f7433e3639e213f901e22cf864"
        `);
        await queryRunner.query(`
            DROP TABLE "deliveries"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."deliveries_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."deliveries_provider_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_69828a178f152f157dcf2f70a8"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_69828a178f152f157dcf2f70a8"
        `);
        await queryRunner.query(`
            DROP TABLE "carts"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2bf7996b7946ce753b60a87468"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_72679d98b31c737937b8932ebe"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_edd714311619a5ad0952504583"
        `);
        await queryRunner.query(`
            DROP TABLE "cart_items"
        `);
        await queryRunner.query(`
            DROP TABLE "product_images"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8d31efd037a7a90fc8a5616df7"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f58772600ed891d77a7504cecd"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8cac65f09aada4d9b4b47a87ba"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_572c5e5eaa86fedef08bbae2b7"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a44d9d7c2c0f89d8ed3071aadd"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d41b47959cb6c367a5ffc58e89"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e40a1dd2909378f0da1f34f7bd"
        `);
        await queryRunner.query(`
            DROP TABLE "products"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."products_shippingmethod_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."products_storagetype_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."products_origin_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."products_sellertype_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."products_condition_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."products_certifications_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."products_unit_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."products_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."products_category_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9007ffba411fd471dfe233dabf"
        `);
        await queryRunner.query(`
            DROP TABLE "reviews"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_role_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "retailers"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."retailers_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."retailers_deliverydays_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."retailers_businesstype_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "farmers"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."farmers_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."farmers_deliverydays_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."farmers_certifications_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."farmers_farmingmethods_enum"
        `);
    }

}
