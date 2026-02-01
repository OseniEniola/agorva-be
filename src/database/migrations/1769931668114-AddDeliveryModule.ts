import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeliveryModule1769931668114 implements MigrationInterface {
    name = 'AddDeliveryModule1769931668114'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_cartId"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_productId"
        `);
        await queryRunner.query(`
            ALTER TABLE "carts" DROP CONSTRAINT "FK_carts_userId"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP CONSTRAINT "FK_deliveries_customerId"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP CONSTRAINT "FK_deliveries_sellerId"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cart_items_cartId"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cart_items_productId"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cart_items_cartId_productId"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_carts_userId"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_deliveries_orderId"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_deliveries_customerId"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_deliveries_sellerId"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_deliveries_status"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_items"
            ALTER COLUMN "createdAt"
            SET DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_items"
            ALTER COLUMN "updatedAt"
            SET DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ALTER COLUMN "createdAt"
            SET DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ALTER COLUMN "updatedAt"
            SET DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "orderId"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "orderId" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "pickupAddress"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "pickupAddress" json NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "pickupContact"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "pickupContact" json NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "dropoffAddress"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "dropoffAddress" json NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "dropoffContact"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "dropoffContact" json NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "items"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "items" json
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "courier"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "courier" json
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "proofOfDelivery"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "proofOfDelivery" json
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "metadata"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "metadata" json
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ALTER COLUMN "createdAt"
            SET DEFAULT now()
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ALTER COLUMN "updatedAt"
            SET DEFAULT now()
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
            CREATE INDEX "IDX_69828a178f152f157dcf2f70a8" ON "carts" ("userId")
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
            DROP INDEX "public"."IDX_f7433e3639e213f901e22cf864"
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
            DROP INDEX "public"."IDX_69828a178f152f157dcf2f70a8"
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
            ALTER TABLE "deliveries"
            ALTER COLUMN "updatedAt"
            SET DEFAULT CURRENT_TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ALTER COLUMN "createdAt"
            SET DEFAULT CURRENT_TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "metadata"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "metadata" jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "proofOfDelivery"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "proofOfDelivery" jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "courier"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "courier" jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "items"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "items" jsonb
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "dropoffContact"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "dropoffContact" jsonb NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "dropoffAddress"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "dropoffAddress" jsonb NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "pickupContact"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "pickupContact" jsonb NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "pickupAddress"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "pickupAddress" jsonb NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries" DROP COLUMN "orderId"
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD "orderId" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ALTER COLUMN "updatedAt"
            SET DEFAULT CURRENT_TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ALTER COLUMN "createdAt"
            SET DEFAULT CURRENT_TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_items"
            ALTER COLUMN "updatedAt"
            SET DEFAULT CURRENT_TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_items"
            ALTER COLUMN "createdAt"
            SET DEFAULT CURRENT_TIMESTAMP
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_deliveries_status" ON "deliveries" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_deliveries_sellerId" ON "deliveries" ("sellerId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_deliveries_customerId" ON "deliveries" ("customerId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_deliveries_orderId" ON "deliveries" ("orderId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_carts_userId" ON "carts" ("userId")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_cart_items_cartId_productId" ON "cart_items" ("cartId", "productId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cart_items_productId" ON "cart_items" ("productId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cart_items_cartId" ON "cart_items" ("cartId")
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD CONSTRAINT "FK_deliveries_sellerId" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "deliveries"
            ADD CONSTRAINT "FK_deliveries_customerId" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ADD CONSTRAINT "FK_carts_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_items"
            ADD CONSTRAINT "FK_cart_items_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_items"
            ADD CONSTRAINT "FK_cart_items_cartId" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

}
