import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateQRTokenLength1734567890125 implements MigrationInterface {
  name = 'UpdateQRTokenLength1734567890125';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, clear any existing QR tokens since they will be UUID format
    await queryRunner.query(`DELETE FROM "qr_tokens"`);
    
    // Update the token column to be 5 characters with a comment
    await queryRunner.query(`ALTER TABLE "qr_tokens" ALTER COLUMN "token" TYPE character varying(5)`);
    await queryRunner.query(`COMMENT ON COLUMN "qr_tokens"."token" IS '5-digit QR token code'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the comment
    await queryRunner.query(`COMMENT ON COLUMN "qr_tokens"."token" IS NULL`);
    
    // Revert the token column back to unlimited varchar (no length constraint)
    await queryRunner.query(`ALTER TABLE "qr_tokens" ALTER COLUMN "token" TYPE character varying`);
    
    // Clear tokens since format will be incompatible
    await queryRunner.query(`DELETE FROM "qr_tokens"`);
  }
}