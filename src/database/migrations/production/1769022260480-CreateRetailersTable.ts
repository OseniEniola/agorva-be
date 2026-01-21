import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRetailersTable1769022260480 implements MigrationInterface {
    name = 'CreateRetailersTable1769022260480'

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
