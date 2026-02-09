import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBusinessSlugToFarmersAndRetailers1707000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add businessSlug column to farmers table
    await queryRunner.addColumn(
      'farmers',
      new TableColumn({
        name: 'businessSlug',
        type: 'varchar',
        isNullable: true,
        isUnique: true,
      }),
    );

    // Add businessSlug column to retailers table
    await queryRunner.addColumn(
      'retailers',
      new TableColumn({
        name: 'businessSlug',
        type: 'varchar',
        isNullable: true,
        isUnique: true,
      }),
    );

    // Create index on businessSlug for faster lookups
    await queryRunner.query(
      `CREATE INDEX "IDX_farmer_business_slug" ON "farmers" ("businessSlug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_retailer_business_slug" ON "retailers" ("businessSlug")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_retailer_business_slug"`);
    await queryRunner.query(`DROP INDEX "IDX_farmer_business_slug"`);

    // Drop columns
    await queryRunner.dropColumn('retailers', 'businessSlug');
    await queryRunner.dropColumn('farmers', 'businessSlug');
  }
}
