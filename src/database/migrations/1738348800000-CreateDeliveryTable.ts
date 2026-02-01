import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateDeliveryTable1738348800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'deliveries',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'orderId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'customerId',
            type: 'uuid',
          },
          {
            name: 'sellerId',
            type: 'uuid',
          },
          {
            name: 'provider',
            type: 'enum',
            enum: ['uber_direct', 'self_delivery', 'pickup'],
            default: "'uber_direct'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'pending',
              'quote_obtained',
              'scheduled',
              'pickup',
              'pickup_complete',
              'in_transit',
              'delivered',
              'canceled',
              'returned',
              'failed',
            ],
            default: "'pending'",
          },
          {
            name: 'externalDeliveryId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'quoteId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'deliveryFee',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'currencyCode',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'trackingUrl',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'pickupAddress',
            type: 'jsonb',
          },
          {
            name: 'pickupContact',
            type: 'jsonb',
          },
          {
            name: 'pickupNotes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'dropoffAddress',
            type: 'jsonb',
          },
          {
            name: 'dropoffContact',
            type: 'jsonb',
          },
          {
            name: 'dropoffNotes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'signatureRequired',
            type: 'boolean',
            default: false,
          },
          {
            name: 'proofOfDeliveryRequired',
            type: 'boolean',
            default: false,
          },
          {
            name: 'items',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'courier',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'pickupEta',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'dropoffEta',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'deliveredAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'scheduledPickupTime',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'scheduledDropoffTime',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'proofOfDelivery',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'cancellationReason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'failureReason',
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
      'deliveries',
      new TableIndex({
        name: 'IDX_deliveries_orderId',
        columnNames: ['orderId'],
      }),
    );

    await queryRunner.createIndex(
      'deliveries',
      new TableIndex({
        name: 'IDX_deliveries_customerId',
        columnNames: ['customerId'],
      }),
    );

    await queryRunner.createIndex(
      'deliveries',
      new TableIndex({
        name: 'IDX_deliveries_sellerId',
        columnNames: ['sellerId'],
      }),
    );

    await queryRunner.createIndex(
      'deliveries',
      new TableIndex({
        name: 'IDX_deliveries_status',
        columnNames: ['status'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'deliveries',
      new TableForeignKey({
        name: 'FK_deliveries_customerId',
        columnNames: ['customerId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'deliveries',
      new TableForeignKey({
        name: 'FK_deliveries_sellerId',
        columnNames: ['sellerId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('deliveries', 'FK_deliveries_sellerId');
    await queryRunner.dropForeignKey('deliveries', 'FK_deliveries_customerId');

    await queryRunner.dropIndex('deliveries', 'IDX_deliveries_status');
    await queryRunner.dropIndex('deliveries', 'IDX_deliveries_sellerId');
    await queryRunner.dropIndex('deliveries', 'IDX_deliveries_customerId');
    await queryRunner.dropIndex('deliveries', 'IDX_deliveries_orderId');

    await queryRunner.dropTable('deliveries');
  }
}
