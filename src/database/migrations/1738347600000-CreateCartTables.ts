import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateCartTables1738347600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create carts table
    await queryRunner.createTable(
      new Table({
        name: 'carts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'tax',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'shippingCost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'total',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'itemCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'lastActivityAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create index on userId
    await queryRunner.createIndex(
      'carts',
      new TableIndex({
        name: 'IDX_carts_userId',
        columnNames: ['userId'],
      }),
    );

    // Create foreign key for userId
    await queryRunner.createForeignKey(
      'carts',
      new TableForeignKey({
        name: 'FK_carts_userId',
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create cart_items table
    await queryRunner.createTable(
      new Table({
        name: 'cart_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'cartId',
            type: 'uuid',
          },
          {
            name: 'productId',
            type: 'uuid',
          },
          {
            name: 'quantity',
            type: 'int',
            default: 1,
          },
          {
            name: 'unitPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'cart_items',
      new TableIndex({
        name: 'IDX_cart_items_cartId',
        columnNames: ['cartId'],
      }),
    );

    await queryRunner.createIndex(
      'cart_items',
      new TableIndex({
        name: 'IDX_cart_items_productId',
        columnNames: ['productId'],
      }),
    );

    await queryRunner.createIndex(
      'cart_items',
      new TableIndex({
        name: 'IDX_cart_items_cartId_productId',
        columnNames: ['cartId', 'productId'],
        isUnique: true,
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        name: 'FK_cart_items_cartId',
        columnNames: ['cartId'],
        referencedTableName: 'carts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        name: 'FK_cart_items_productId',
        columnNames: ['productId'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.dropForeignKey('cart_items', 'FK_cart_items_productId');
    await queryRunner.dropForeignKey('cart_items', 'FK_cart_items_cartId');

    // Drop indexes
    await queryRunner.dropIndex('cart_items', 'IDX_cart_items_cartId_productId');
    await queryRunner.dropIndex('cart_items', 'IDX_cart_items_productId');
    await queryRunner.dropIndex('cart_items', 'IDX_cart_items_cartId');

    // Drop cart_items table
    await queryRunner.dropTable('cart_items');

    // Drop carts foreign key and indexes
    await queryRunner.dropForeignKey('carts', 'FK_carts_userId');
    await queryRunner.dropIndex('carts', 'IDX_carts_userId');

    // Drop carts table
    await queryRunner.dropTable('carts');
  }
}
