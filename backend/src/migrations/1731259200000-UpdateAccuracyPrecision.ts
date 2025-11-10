import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAccuracyPrecision1731259200000 implements MigrationInterface {
  name = 'UpdateAccuracyPrecision1731259200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update accuracy column to support larger GPS accuracy values
    await queryRunner.query(
      `ALTER TABLE "attendance_records" ALTER COLUMN "accuracy" TYPE DECIMAL(8,2)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert accuracy column to previous precision (might cause data loss if values > 9999.99)
    await queryRunner.query(
      `ALTER TABLE "attendance_records" ALTER COLUMN "accuracy" TYPE DECIMAL(6,2)`
    );
  }
}