import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRetailerUserRelation1767610898419 implements MigrationInterface {
    name = 'AddRetailerUserRelation1767610898419'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "retailers"
            ALTER COLUMN "businessId" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "retailers"
            ALTER COLUMN "businessId"
            SET DEFAULT uuid_generate_v4()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "retailers"
            ALTER COLUMN "businessId" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "retailers"
            ALTER COLUMN "businessId"
            SET DEFAULT uuid_generate_v4()
        `);
    }

}
